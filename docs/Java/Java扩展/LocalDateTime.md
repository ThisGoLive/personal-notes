参考资料：好好学Java https://mp.weixin.qq.com/s/Dd_7yUh3lq3TqE2cjsYXvw

JDK8新特性里提供了3个时间类：LocalDate、LocalTime、LocalDateTime

在项目开发中，已经需要对Date类型进行格式，否则可读性很差，格式化Date类型要使用SimpleDateFormat，但SimpleDateFormat是现成不安全的。

**1. 为什么需要LocalDate、LocalTime、LocalDateTime**

**1.1 Date如果不格式化，打印出的日期可读性差**

```
Tue Sep 10 09:34:04 CST 2019
```

**1.2 使用SimpleDateFormat对时间进行格式**化，但SimpleDateFormat是线程不安全的。SimpleDateFormat的format方法最终调用代码：

```java
private StringBuffer format(Date date, StringBuffer toAppendTo, FieldDelegate delegate) {
        // Convert input date to time field list
        calendar.setTime(date);
        boolean useDateFormatSymbols = useDateFormatSymbols();
        for (int i = 0; i < compiledPattern.length; ) {
            int tag = compiledPattern[i] >>> 8;
            int count = compiledPattern[i++] & 0xff;
            if (count == 255) {
                count = compiledPattern[i++] << 16;
                count |= compiledPattern[i++];
            }
            switch (tag) {
                case TAG_QUOTE_ASCII_CHAR:
                    toAppendTo.append((char) count);
                    break;
                case TAG_QUOTE_CHARS:
                    toAppendTo.append(compiledPattern, i, count);
                    i += count;
                    break;
                default:
                    subFormat(tag, count, delegate, toAppendTo, useDateFormatSymbols);
                    break;
            }
        }
        return toAppendTo;
    }
```

　　calendar是共享变量，并且这个共享变量没有做线程安全控制。当多个线程同时使用相同的SimpleDateFormat对象【如用static修饰的SimpleDateFormat】调用format方法时，多个线程会同时调用calendar.setTime方法，可能一个线程刚设置好time值 另外的一个线程马上把设置的time值给修改了导致返回的格式化时间可能是错误的。

　　在多并发情况下使用SimpleDateFormat需格外注意  SimpleDateFormat除了format是线程不安全以外，parse方法也是线程不安全的。parse方法实际调用alb.establish(calendar).getTime()方法来解析，alb.establish(calendar)方法里主要完成了

　　a、重置日期对象cal的属性值

　　b、使用calb中中属性设置cal

　　c、返回设置好的cal对象

　　但是这三步不是原子操作。

　　多线程并发如何保证线程安全 -  避免线程之间共享一个SimpleDateFormat对象，每个线程使用时都创建一次SimpleDateFormat对象 =>  创建和销毁对象的开销大 - 对使用format和parse方法的地方进行加锁 => 线程阻塞性能差 -  使用ThreadLocal保证每个线程最多只创建一次SimpleDateFormat对象 =>  较好的方法。Date对时间处理比较麻烦，比如想获取某年、某月、某星期，以及n天以后的时间，如果用Date来处理的话真是太难了，你可能会说Date类不是有getYear、getMonth这些方法吗，获取年月日很Easy，但都被弃用了。

　　

**2. Java8全新的日期和时间API**

**2.1 LocalDate**

　　LocalDate是日期处理类，具体API如下：

```java
// 获取当前日期
LocalDate now = LocalDate.now();
// 设置日期
LocalDate localDate = LocalDate.of(2019, 9, 10);
// 获取年
int year = localDate.getYear();     //结果：2019
int year1 = localDate.get(ChronoField.YEAR); //结果：2019
// 获取月
Month month = localDate.getMonth();   // 结果：SEPTEMBER
int month1 = localDate.get(ChronoField.MONTH_OF_YEAR); //结果：9
// 获取日
int day = localDate.getDayOfMonth();   //结果：10
int day1 = localDate.get(ChronoField.DAY_OF_MONTH); // 结果：10
// 获取星期
DayOfWeek dayOfWeek = localDate.getDayOfWeek();   //结果：TUESDAY
int dayOfWeek1 = localDate.get(ChronoField.DAY_OF_WEEK); //结果：2
```

**2.2 LocalTime**

　　LocalTime是时间处理类，具体API如下：

```java
// 获取当前时间
LocalTime now = LocalTime.now();
// 设置时间
LocalTime localTime = LocalTime.of(13, 51, 10);
//获取小时
int hour = localTime.getHour();    // 结果：13
int hour1 = localTime.get(ChronoField.HOUR_OF_DAY); // 结果：13
//获取分
int minute = localTime.getMinute();  // 结果：51
int minute1 = localTime.get(ChronoField.MINUTE_OF_HOUR); // 结果：51
//获取秒
int second = localTime.getSecond();   // 结果：10
int second1 = localTime.get(ChronoField.SECOND_OF_MINUTE); // 结果：10
```

**2.3 LocalDateTime**

　　LocalDateTime可以设置年月日时分秒，相当于LocalDate + LocalTime

```java
// 获取当前日期时间
LocalDateTime localDateTime = LocalDateTime.now();
// 设置日期
LocalDateTime localDateTime1 = LocalDateTime.of(2019, Month.SEPTEMBER, 10, 14, 46, 56);
LocalDateTime localDateTime2 = LocalDateTime.of(localDate, localTime);
LocalDateTime localDateTime3 = localDate.atTime(localTime);
LocalDateTime localDateTime4 = localTime.atDate(localDate);
// 获取LocalDate
LocalDate localDate2 = localDateTime.toLocalDate();
// 获取LocalTime
LocalTime localTime2 = localDateTime.toLocalTime();
```

**2.4 Instant**

```java
// 创建Instant对象
Instant instant = Instant.now();
// 获取秒
long currentSecond = instant.getEpochSecond();
// 获取毫秒
long currentMilli = instant.toEpochMilli();
```

　　如果只是为了获取秒数或者毫秒数，使用System.currentTimeMillis()来得更为方便

**2.5 修改LocalDate、LocalTime、LocalDateTime、Instant**

　　LocalDate、LocalTime、LocalDateTime、Instant为不可变对象，修改这些对象对象会返回一个副本。增加、减少年数、月数、天数等 以LocalDateTime为例。

```java
// 创建日期：2019-09-10 14:46:56
LocalDateTime localDateTime = LocalDateTime.of(2019, Month.SEPTEMBER, 10, 14, 46, 56);
//增加一年
localDateTime = localDateTime.plusYears(1);  //结果： 2020-09-10 14:46:56
localDateTime = localDateTime.plus(1, ChronoUnit.YEARS); //结果： 2021-09-10 14:46:56
//减少一个月
localDateTime = localDateTime.minusMonths(1);  //结果： 2021-08-10 14:46:56
localDateTime = localDateTime.minus(1, ChronoUnit.MONTHS); //结果： 2021-07-10 14:46:56
```

　　通过with修改某些值，年月日时分秒都可以通过with方法设置。

```java
//修改年为2019
localDateTime = localDateTime.withYear(2020);
//修改为2022
localDateTime = localDateTime.with(ChronoField.YEAR, 2022);
```

　　**日期计算。**比如有些时候想知道这个月的最后一天是几号、下个周末是几号，通过提供的时间和日期API可以很快得到答案 。TemporalAdjusters提供的各种日期时间格式化的静态类，比如firstDayOfYear是当前日期所属年的第一天

```java
LocalDate localDate = LocalDate.now();
LocalDate localDate1 = localDate.with(TemporalAdjusters.firstDayOfYear());
```

 　**格式化时间。**DateTimeFormatter默认提供了多种格式化方式，如果默认提供的不能满足要求，可以通过DateTimeFormatter的ofPattern方法创建自定义格式化方式

```java
LocalDate localDate = LocalDate.of(2019, 9, 10);
String s1 = localDate.format(DateTimeFormatter.BASIC_ISO_DATE);
String s2 = localDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
//自定义格式化
DateTimeFormatter dateTimeFormatter =   DateTimeFormatter.ofPattern("dd/MM/yyyy");
String s3 = localDate.format(dateTimeFormatter);
```

　　**解析时间。**和SimpleDateFormat相比，DateTimeFormatter是线程安全的

```java
LocalDate localDate1 = LocalDate.parse("20190910", DateTimeFormatter.BASIC_ISO_DATE);
LocalDate localDate2 = LocalDate.parse("2019-09-10", DateTimeFormatter.ISO_LOCAL_DATE);
```

　　**Date与LocalDateTime转换。**

```java
/**
  * LocalDateTime转毫秒时间戳
  * @param localDateTime LocalDateTime
  * @return 时间戳
  */
public static Long localDateTimeToTimestamp(LocalDateTime localDateTime) {
    try {
        ZoneId zoneId = ZoneId.systemDefault();
        Instant instant = localDateTime.atZone(zoneId).toInstant();
        return instant.toEpochMilli();
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}

/**
 * 时间戳转LocalDateTime
 * @param timestamp 时间戳
 * @return LocalDateTime
 */
public static LocalDateTime timestampToLocalDateTime(long timestamp) {
    try {
        Instant instant = Instant.ofEpochMilli(timestamp);
        ZoneId zone = ZoneId.systemDefault();
        return LocalDateTime.ofInstant(instant, zone);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}

/**
 * Date转LocalDateTime
 * @param date Date
 * @return LocalDateTime
 */
public static LocalDateTime dateToLocalDateTime(Date date) {
    try {
        Instant instant = date.toInstant();
        ZoneId zoneId = ZoneId.systemDefault();
        return instant.atZone(zoneId).toLocalDateTime();
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}

/**
 * LocalDateTime转Date
 * @param localDateTime LocalDateTime
 * @return Date
 */
public static Date localDateTimeToDate(LocalDateTime localDateTime) {
    try {
        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime zdt = localDateTime.atZone(zoneId);
        return Date.from(zdt.toInstant());
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}
```

　　**SpringBoot中应用LocalDateTime**

　　将LocalDateTime字段以时间戳的方式返回给前端 添加日期转化类

```java
    public class LocalDateTimeConverter extends JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            gen.writeNumber(value.toInstant(ZoneOffset.of("+8")).toEpochMilli());
        }
    }
```

　　并在LocalDateTime字段上添加@JsonSerialize(using = LocalDateTimeConverter.class)注解，如下：

```java
@JsonSerialize(using = LocalDateTimeConverter.class)
protected LocalDateTime gmtModified;
```

　　将LocalDateTime字段以指定格式化日期的方式返回给前端  在LocalDateTime字段上添加@JsonFormat(shape=JsonFormat.Shape.STRING,  pattern="yyyy-MM-dd HH:mm:ss")注解即可，如下：

```java
@JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd HH:mm:ss")
protected LocalDateTime gmtModified;
```

　　对前端传入的日期进行格式化 在LocalDateTime字段上添加@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")注解即可，如下：

```java
@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
protected LocalDateTime gmtModified;
```