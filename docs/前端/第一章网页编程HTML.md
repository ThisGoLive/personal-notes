# 第一章: 网页HTML编程 #
## 1.1. HTML简介 ##
### 1.1.1 什么是HTML ###
1.	HTML 是用来描述网页的一种语言
2.	HTML 指的是超文本标记语言: HyperText Markup Language
3.	HTML 不是一中编程语言,而是标记语言.
4.	标记语言的一套标记标签.
5.	HTML 使用标记标签来描述网页.
6.	HTML 文档包含了HTML 标签及文本内容.
7.	HTML文档也叫做web页面
### 1.1.2 HTML标签 ###
1. HTML 
标记标签通常被称为
 HTML 
标签
 (HTML tag)
。
2. HTML 
标签是由尖括号包围的关键词，⽐比如
 `<html>`
3. HTML 
标签通常是成对出现的，⽐比如
 `<b> `
和
 `</b>`
4. 
标签对中的第⼀一个标签是开始标签，第⼆二个标签是结束标签
5. 
开始和结束标签也被称为开放标签和闭合标签
### 1.1.3  网页结构 ###
```html
	<!DOCTYPE html>
	<html>
		<head>
		        <meta charset='UTF-8'>
		        <title></title>
		</head>
		<body>
		        <h1>这是标题</h1>
		        <p>这是正⽂文</p>
		<body>
	</html>
```
### 1.1.4 <!DOCTYPE>声明 ###
-	<!DOCTYPE>声明有助于浏览器中正确显⽰网页。
-	网络上有很多不同的⽂文件，如果能够正确声明HTML的版本，浏览器就能正确显⽰示⺴⽹网⻚页内容。doctype 声明是不区分⼤大⼩小写的
为什么要定义⽂文档类型？

	1. Web 世界中存在许多不同的⽂文档。只有了解⽂文档的类型，浏览器才能正确地显⽰示⽂文档。
	2.	 HTML 也有多个不同的版本，只有完全明⽩白⻚页⾯面中使⽤用的确切HTML 版本，浏览器才能完全正确地显⽰示出HTML页⾯面。这就是<!DOCTYPE> 的⽤用处。
	3. <!DOCTYPE> 不是HTML 标签。它为浏览器提供⼀一项信息（声明），即HTML 是⽤用什么版本编写的。

#### HTML 5 ####
	<!DOCTYPE HTML>
#### HTML4.01 ####
	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
#### HTML1.0 ####
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
### 1.1.5 HTML标签 ###
1. `<meta>`标签提供了HTML ⽂文档的元数据。元数据不会显⽰示在客户端，当时会被浏览器解析。
2. META元素通常⽤用于指定网页的描述，关键词，⽂文件的最后修改，作者，和其他元数据。元数据可以被使⽤用浏览器
（如何显⽰示内容或重新加载页面），搜索引擎（关键词），或其他Web 服务调⽤.
```html
		<head>
			<meta name="description" content="Free Web tutorials">
			<meta name="keywords" content="HTML,CSS,XML,JavaScript">
			<meta name="author" content="Ståle Refsnes">
			<meta charset="UTF-8">
		</head>
```
## 1.2. HTML基础 ##
### 1.2.1 标题 ###
```html
HTML 标题（Heading）是通过<h1> - <h6>标签来定义的. 

	<h1>这是主标题
	</h1></br> 
	<h1>
	这是主标题
	</h1></br> 
	<h1>
	这是主标题
	</h1></br> 
	<h1>
	这是主标题
	</h1></br>
```
### 1.2.2 段落 ###
```html
	<p>
	这是一个段落
	</p>
```
### 1.2.3 链接 ###
```html
	<a href="www.baidu.com">
	这是一个链接
	</a>
```
*创建一个描点*
```html
	<a href="#C4">查看 Chapter 4。</a>
	<h2><a name="C4">Chapter 4</a></h2>
```
### 1.2.4 HTML图像 ###
```html
	<img src='images/1.jpg' width='100px;' height='200px;'/>
```
### 1.2.5 HTML br 标签
```html
	<br> 
	标签插入一个简单的换行符。
	<br> 
```
标签是一个空标签，意味着它没有结束标签。
### 1.2.6  HTML hr 标签
```html
	<h1>HTML</h1>
	<p>HTML is a language for describing web pages.....</p>
	<hr>
	<h1>CSS</h1>
	<p>CSS defines how to display HTML elements.....</p>
```
### 1.2.7 HTML 注释标签
```html
	<!--这是⼀一个注释，注释在浏览器中不会显⽰示-->
```
## 1.3. HTML格式标签 ##
### 1.3.1 HTML标签 ###
```html
	 <abbr> 标签用来表示一个缩写词或者首字母缩略词，如
	"WWW"或者"NATO"。
	 The <abbr title="ZhongGuo">zg</abbr> 
```
### 1.3.2  HTML address标签 ###
	如果`<address>` 元素位于`<body>` 元素内部，则它表⽰示该⽂文档所有者的联系信息
```html
    <address>
        Written by <a href="mailto:webmaster@example.com">Jon Doe</         a>.<br> 
        Visit us at:<br>
        Example.com<br>
        Box 564, Disneyland<br>
        USA
    </address>
```
### 1.3.3 定义粗体的文本 ###
1. 根据HTML 5 的规范，标签应该做为最后的选择，只有在没有其他标记比较合适时才使用它。
```html
		<b>my first html</b>
```
2. 重要的文本应该用标签表示。
```html
		<strong>html5 should bu use</strong>
```
3. 被标记的或者高亮显示的文本应该用`<mark>`标签表示。
```html
		<mark>mark text</mark>
```
4. 被强调的文本应该用`<em>`标签表示，斜体突出强调
```html
		<em>被强调的文字</em>
```
提示：您也可以使⽤用CSS 的"font-weight" 属性设置粗体文本
### 1.3.4 HTML <bdo\>标签 ###
<bdo\>
标签用来覆盖默认的文本方向。

值：ltr(从左开始)、rtr（从右开始）。
```html
	<bdo dir="rtl">
	This text will go right-to-left.
	</bdo>
```
### 1.3.5 HTML i标签
i定义与文本中其余部分不同的部分，并把这部分文本呈现为斜体文本。
```html
	<p>He named his car <i>The lightning</i>, 
	because it was very         fast.</p>
```
### 1.3.6 HTML ins标签
ins标签定义已经被插入文档中的文本。
```html
	<p>My favorite color is <del>blue</del> <ins>red</ins>!</p>
<p>My favorite color is <del>blue</del> <ins>red</ins>!</p>
```
### 1.3.7 HTML pre标签
1. pre标签可定义预格式化的文本。
2. 被包围在pre标签元素中的文本通常会保留空格和换行符。而文本也会呈现为等宽字体。
```html
		<pre>1
			4  22                  5
		</pre>
```
### 1.3.8 HTML q标签
q标签定义一个短的引用。
```html
	<p>徐⽼老师说:
	<q>你们即将引来⼀一个痛苦的阶段</q>
	但是总能熬过</p>
```
### 1.3.9 u标签
使⽤用u标签为文本添加下划线：
```html
	<u>This is a 
	parragraph.</u>
```
提示：尽量避免使⽤用此标签，用户会把超链接和下划线混淆。
## 1.4. HTML表单
### 1.4.1 form标签
什么是表单？

1. 表单是一个包含表单元素的区域。
2. 表单元素是允许用户在表单中（比如：文本域、下拉列表、单选框、复选框等等）输入信息的元素。
```html
		<form action="demo_form.php" method="get">
		    First name: <input type="text" name="fname"><br>
		    Last name: <input type="text" name="lname"><br>
		    <input type="submit" value="Submit">
		</form>
```
### 1.4.2 input标签
input标签规定了用户可以在其中输入数据的输入字段。
```html
	<input type="text" name="fname"><br>
```
### 1.4.3 textarea标签
1.	定义了一个多行文本框
2.	可以通过cols和rows属性来规定textare 的尺寸大小,不过更好的办法是使用css的height 和width属性.
3.	maxlength,允许文本域的最大字符数.
4.	readonly,规定文本区域为只读.
5.	disabled,规定禁用文本域
```html
		<textarea rows="10" cols="30">
		我是一个文本框。
		</textarea>
```
### 1.4.4 button标签
1. button标签定义⼀一个按钮。
2. 在button元素内部，您可以放置内容，⽐比如⽂文本或图像。这是该元素与使⽤用 input 元素创建的按钮之间的不同之处。

		按钮的两种⽅方式：
```html
		<input type='button'/ value='
		按钮'>
		<button>
		按钮
		</button>
```
属性列表:

| 属性 | 属性值 | 作用 |
| --- | --- | --- |
| disabled | disabled | 规定应该禁用该按钮 |
| formaction | URL | 规定当提交表单时向何处发送表单数据.覆盖form元素的action属性,该属性与type="submit"配合使用 |

### 1.4.5  select 元素用来创建下拉列表。 ###
1. select元素⽤用来创建下拉列表。
2. select元素中的
```html
		<select>
		    <option value="volvo">Volvo</option>
		    <option value="saab">Saab</option>
		    <option value="mercedes">Mercedes</option>
		    <option value="audi">Audi</option>
		</select>
```

| 属性 | 属性值 | 作用 |
| --- | --- | --- |
| disabled | disabled | 规定应该禁用下拉列表 |
| multiple | multiple | 当该属性为true时,可以选择多个选项 |
| size | number | 规定列表中可见选项的数目 |

### 1.4.6 label标签
<label\>标签为input 元素定义标注（标记）。

	<label for="male">Male</label>
### 1.4.7 <fieldset\>标签 ###
1. <fieldset\>标签可以将表单内的相关元素分组。
2. <fieldset\>标签会在相关表单元素周围绘制边框。
```html
		<form>
		  <fieldset>
		    <legend>Personalia:</legend>
		    Name: <input type="text"><br>
		    Email: <input type="text"><br>
		    Date of birth: <input type="text">
		  </fieldset>
		</form>
<form>
  <fieldset>
    <legend>Personalia:</legend>
    Name: <input type="text"><br>
    Email: <input type="text"><br>
    Date of birth: <input type="text">
  </fieldset>
</form>
```
## 1.5. HTML框架 ##
### iframe ###
1. <iframe\>标签规定一个内联框架。
2. 一个内联框架被⽤用来在当前HTML ⽂文档中嵌入另一个文档。

		<iframe src="http://www.sina.com"></iframe>
## 1.6. <link\>标签 ##
导入外部css文件
```html
	<head>
		<link rel='stylesheet' type='text/css' href='css/sty.css'></link>
	</head>
```
## 1.7. 表格 ##
### 1.7.1 table定义一个表格 ###
```html
	<table border="1">
	    <tr>
	        <th>Month</th>
	        <th>Savings</th>
	    </tr>
	    <tr>
	        <td>January</td>
	        <td>$100</td>
	    </tr>
	</table>
```
1.	一个HTML表格包括<table\>元素,一个或多个<tr\>,<th\>,<td\>元素.
2.	<tr\>元素定义表格的行,<th\>定义表头,<td\>定义单元.
3.	更复杂的HTML表格也可能包括<caption\>,<col\>,<colgroup\>,<thead\>,<tfoot\>,<tbody\>元素
### 1.7.2 <th\>标签 ###
1. 标签定义HTML 表格中的表头单元格。
2. HTML 表格有两种单元格类型：
	1.	 表头单元格包含头部信息（由元素创建）
	2.	标准单元格包含数据（由元素创建）
3.	元素中的文本通常呈现为粗体并且居中。
4. 元素中的文本通常是普通的左对齐文本。
5. colspan合并列，rowspan合并行。
```html
		<table>
		<tr ><td colspan="3"></td></tr>
		<tr><td rowspan="3"></td><td></td><td></td></tr>
		<tr><td></td><td></td></tr>
		</table>
```
### 1.7.3 <col\>标签 ###
您只能在 table 或 colgroup 元素中使用 <col> 标签。

<col\>标签规定了<colgroup\>元素内部的每一列的列属性。
## 1.8.样式和布局 ##
### 1.8.1 <div\>标签 ###
1. 标签定义HTML 文档中的一个分隔区块或者一个区域部分。
2. 标签常⽤用于组合块级元素，以便通过CSS 来对这些元素进⾏行格式化。
```html
<div style="color:#0000FF">
	            <h3>This is a heading</h3>
	            <p>This is a paragraph.</p>
	        </div>
```
### 1.8.2 <span\>标签 ###
1. 用于对⽂文档中的⾏行内元素进⾏行组合。
```html
		<p>
		我有
		 <span style="color:blue">
		蓝色
		</span> 
		的眼睛。
		</p>
```