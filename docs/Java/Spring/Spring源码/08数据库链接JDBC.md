[[TOC]]

# 第八章 数据库连接JDBC

数据库 MySQL； 基本命令

+ MySQL -u root -p
+ create database springjdbc
+ show databases
+ use springjdbc 
+ CREATE table students (stu_id int(11) not null auto_increment,stu_name varchar(255) default null,stu_age int(11) default 0,stu_gender int(1) default 2,primary key (stu_id))engine = innodb default charset = utf8;
+ DROP DATABASE 库名
+ DROP TABLE 表名
+ INSERT INTO 表名 VALUES ("hyq","M")
+ UPDATE 表名 SET 字段名1='a',字段名2='b' WHERE 字段名3='c'

## 8.1 SpringJDBC 连接数据库

（1） 创建表

（2） 创建实体bean

（3） 创建实体与表的映射

```java
public class SutdentsRowMapper implements RowMapper<StudentsBean> {
	@Override
	public StudentsBean mapRow(ResultSet rs, int rowNum) throws SQLException {
		StudentsBean bean = new StudentsBean();
		bean.setId(rs.getInt("stu_id"));
		bean.setName(rs.getString("stu_name"));
		bean.setAge(rs.getInt("stu_age"));
		bean.setGengder(rs.getInt("stu_gender"));
		
		return bean;
	}
}
```

（4） 创建 数据服务service及其实现

```java
public class StudentServiceImpl implements IStudentService{

	private JdbcTemplate jdbc;
	
	public void setDataSource(DataSource ds) {
		this.jdbc = new JdbcTemplate(ds);
	}
	
	@Override
	public void save(StudentsBean bean) {
		jdbc.update("Insert into students ( stu_name , stu_age , stu_gender ) values (?,?,?)" 
				,new Object[] {bean.getName(),bean.getAge(),bean.getGengder() ,
						new int[] {java.sql.Types.VARCHAR,java.sql.Types.INTEGER,java.sql.Types.INTEGER}} );
	}

	@Override
	public List<StudentsBean> findAll() {
		List<StudentsBean> li = jdbc.query("select * from students", new SutdentsRowMapper());
		return li;
	}

}
```

（5） 配置spring文件

```xml
<!-- <context:property-placeholder location="classpath:mysql.properties"
		ignore-unresolvable="true" ignore-resource-not-found="true" /> 与下面 效果相同-->
	<bean id="configurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
		<property name="locations">
	    	<list>
	        	<value>classpath:mysql.properties</value>
	        </list>
	    </property>
	</bean>
	<!-- 配置数据源 连接池-->
	<bean id="dataSource" class="org.apache.commons.dbcp2.BasicDataSource" destroy-method="close">
		<property name="driverClassName" value="${mysql.driver}"></property>
		<property name="url" value="${mysql.host}"></property>
		<property name="username" value="${mysql.user}"></property>
		<property name="password" value="${mysql.pwd}"></property>
		<!-- 初始连接数 -->
		<property name="initialSize" value="1"></property>
		<!-- 最大连接数  dbcp2 这个版本没有？-->
		<!-- <property name="maxActive maxActive" value="70"></property> -->
		<!-- 连接数 保持最大 -->
		<property name="maxIdle" value="10"></property>
		<!-- 连接数 保持最小 -->
		<property name="minIdle" value="1"></property>
	</bean>
	<bean id="stuService" class="SpringCode8JDBC.SpringCode8JDBC.service.impl.StudentServiceImpl">
		<property name="dataSource" ref="dataSource"></property>
	</bean>
```

（7） 测试

```java
		StudentsBean bean = new StudentsBean();
		bean.setAge(4);
		bean.setGengder(1);
		bean.setName("老王");
		IStudentService iss = (IStudentService) context.getBean("stuService");
//		iss.save(bean);
		iss.findAll().stream().forEach(System.out::println);
		iss.findAll().stream().forEach(stu ->System.out.println(stu));
```

## 8.2 save 与 update 的实现

跟随 `jdbc.update` 可以找到

### 8.2.1 基础方法 execute

```java
	public <T> T execute(PreparedStatementCreator psc, PreparedStatementCallback<T> action)
			throws DataAccessException {

		Assert.notNull(psc, "PreparedStatementCreator must not be null");
		Assert.notNull(action, "Callback object must not be null");
		if (logger.isDebugEnabled()) {
			String sql = getSql(psc);
			logger.debug("Executing prepared SQL statement" + (sql != null ? " [" + sql + "]" : ""));
		}

        // 1. 获取数据库连接
		Connection con = DataSourceUtils.getConnection(getDataSource());
		PreparedStatement ps = null;
		try {
			Connection conToUse = con;
			if (this.nativeJdbcExtractor != null &&
					this.nativeJdbcExtractor.isNativeConnectionNecessaryForNativePreparedStatements()) {
				conToUse = this.nativeJdbcExtractor.getNativeConnection(con);
			}
			ps = psc.createPreparedStatement(conToUse);
			// 2.输入参数
            applyStatementSettings(ps);
			PreparedStatement psToUse = ps;
			if (this.nativeJdbcExtractor != null) {
				psToUse = this.nativeJdbcExtractor.getNativePreparedStatement(ps);
			}
            // 3.调用回调函数
			T result = action.doInPreparedStatement(psToUse);
            // 4.警告处理
            handleWarnings(ps);
			return result;
		}
		catch (SQLException ex) {
			// Release Connection early, to avoid potential connection pool deadlock
			// in the case when the exception translator hasn't been initialized yet.
			// 5.发生异常 释放数据库连接 避免当没有被初始化的时候出现潜在的连接池 死锁
            if (psc instanceof ParameterDisposer) {
				((ParameterDisposer) psc).cleanupParameters();
			}
			String sql = getSql(psc);
			psc = null;
			JdbcUtils.closeStatement(ps);
			ps = null;
            // 释放
			DataSourceUtils.releaseConnection(con, getDataSource());
			con = null;
			throw getExceptionTranslator().translate("PreparedStatementCallback", sql, ex);
		}
		finally {
			if (psc instanceof ParameterDisposer) {
				((ParameterDisposer) psc).cleanupParameters();
			}
			JdbcUtils.closeStatement(ps);
			DataSourceUtils.releaseConnection(con, getDataSource());
		}
	}

```

**资源释放：**数据库连接的释放并不是直接调用Connection的close方法。如果当前线程存在事物的情况，那么说明当前线程中存在共用数据库连接，这种情况下直接使用ConnectionHolder的released 方法进行连接数减一，而不是真正的释放连接。

### 8.2.2 update 中的 回调函数

`PreparedStatementCallback`作为一个接口，只有 `doInPreparedStatement`用于在调用通用方法 execute 时，处理一些个性化的问题。主要就是将 参数 设置进SQL 中功能。

## 8.3 query 功能实现

基本也是顺着寻找：

```java
	@Override
	public <T> T query(final String sql, final ResultSetExtractor<T> rse) throws DataAccessException {
		Assert.notNull(sql, "SQL must not be null");
		Assert.notNull(rse, "ResultSetExtractor must not be null");
		if (logger.isDebugEnabled()) {
			logger.debug("Executing SQL query [" + sql + "]");
		}

		class QueryStatementCallback implements StatementCallback<T>, SqlProvider {
			@Override
			public T doInStatement(Statement stmt) throws SQLException {
				ResultSet rs = null;
				try {
					rs = stmt.executeQuery(sql);
					ResultSet rsToUse = rs;
					if (nativeJdbcExtractor != null) {
						rsToUse = nativeJdbcExtractor.getNativeResultSet(rs);
					}
					return rse.extractData(rsToUse);
				}
				finally {
					JdbcUtils.closeResultSet(rs);
				}
			}
			@Override
			public String getSql() {
				return sql;
			}
		}

		return execute(new QueryStatementCallback());
	}

	@Override
	public <T> T execute(StatementCallback<T> action) throws DataAccessException {
		Assert.notNull(action, "Callback object must not be null");

		Connection con = DataSourceUtils.getConnection(getDataSource());
		Statement stmt = null;
		try {
			Connection conToUse = con;
			if (this.nativeJdbcExtractor != null &&
					this.nativeJdbcExtractor.isNativeConnectionNecessaryForNativeStatements()) {
				conToUse = this.nativeJdbcExtractor.getNativeConnection(con);
			}
			stmt = conToUse.createStatement();
			applyStatementSettings(stmt);
			Statement stmtToUse = stmt;
			if (this.nativeJdbcExtractor != null) {
				stmtToUse = this.nativeJdbcExtractor.getNativeStatement(stmt);
			}
			T result = action.doInStatement(stmtToUse);
			handleWarnings(stmt);
			return result;
		}
		catch (SQLException ex) {
			// Release Connection early, to avoid potential connection pool deadlock
			// in the case when the exception translator hasn't been initialized yet.
			JdbcUtils.closeStatement(stmt);
			stmt = null;
            // 释放
			DataSourceUtils.releaseConnection(con, getDataSource());
			con = null;
			throw getExceptionTranslator().translate("StatementCallback", getSql(action), ex);
		}
		finally {
			JdbcUtils.closeStatement(stmt);
			DataSourceUtils.releaseConnection(con, getDataSource());
		}
	}

```

整体和update 实现逻辑基本相同。不过回调 `StatementCallback` 是 执行的 `ps.executeQuery()`;

## 8.4 queryForObject

spring不仅提供了query方法，还在基础上封装出queryForObject； 主要是依靠 `RowMapper`进行解析。查询结果，直接用 mapper 解析封装。