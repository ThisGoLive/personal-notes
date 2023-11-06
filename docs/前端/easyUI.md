# easyUI #
datagrid加载数据的两种方式

	var str = '{"total":2,"rows":[{id:"1",name:"一"},{id:"2",name:"二"}]}';   
	var data = $.parseJSON(str);    
	$('#dg').datagrid('loadData', data);
	
	$('#dg').datagrid({   
	url:'datagrid_data2.json'   
	});  
url是数据源地址，至于是json文件或者aspx文件无关，只需要返回标准json格式字符串和你配置的columns一样就行

	$('#getPager').pagination({
	        onSelectPage:function(pageNumber, pageSize){
	            $(this).pagination('loading');
	            alert('pageNumber:'+pageNumber+',pageSize:'+pageSize);
	
	            $(this).pagination('loaded');
	            $('#dataGrid').datagrid({
	                url:'datagrid_data2.json'
	            });
	        }
	    });
#### 分页 
	$(function(){
	        $("#myTable").datagrid({
	            title: "表单数据",
	            width: 600,
	            height: 260,
	            collapsible: true,
	            url: "GetDataGridServlet",
	            method: 'POST',
	            sortName: 'title',
	            loadMsg: "数据加载中...",
	            pagination:true,
	            striped: true,
				pageSize: 5,//每页显示的记录条数，默认为5  
	            pageList: [5, 10],//可以设置每页记录条数的列表  
	            columns:[[
	                {title: '姓名', field: 'name', width: 100, align: 'center'},
	                {title: '性别', field: 'sex', width: 50, align: 'center'},
	                {title: '年龄', field: 'age', width: 50, align: 'center'},
	                {title: '出生日期', field: 'birthday', width: 200, align: 'center'}
	            ]]
	        });
	         
	        var p = $('#myTable').datagrid('getPager');  
	            $(p).pagination({  
	            
	            beforePageText: '第',//页数文本框前显示的汉字  
	            afterPageText: '页    共 {pages} 页',  
	            displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录'
	        });  
	    });	
	
	 int pageSize = Integer.parseInt(request.getParameter("page"));
	  int rows = Integer.parseInt(request.getParameter("rows"));
#### 详细 ####
EasyUI 的 datagrid 支持服务器端分页，但是官方的资料比较少，以下总结了两种 datagrid 的服务器端分页机制，可根据情况具体使用。

一：使用 datagrid 默认机制

后台：

	public JsonResult GetQuestionUnit()
	{
	    // easyui datagrid 自身会通过 post 的形式传递 rows and page
	    int pageSize = Convert.ToInt32(Request["rows"]);
	    int pageNum = Convert.ToInt32(Request["page"]);
	
	    var dal = new QsQuestionUnitDal();
	    var questionUnits = dal.GetList("",pageNum -1, pageSize);
	    // 返回到前台的值必须按照如下的格式包括 total and rows
	    var easyUIPages = new Dictionary<string, object>();
	    easyUIPages.Add("total", questionUnits.FirstOrDefault() == null ? 0 : questionUnits.FirstOrDefault().ReqCount);
	    easyUIPages.Add("rows", questionUnits);
	
	    return Json(easyUIPages, JsonRequestBehavior.AllowGet);
	}

前台：

	(function () {
	
	('#dgd').datagrid({
	        pageNumber: 1,
	        //url: "@ViewBag.Domain/Paper/GetQuestionUnit?arg1=xxx",
	        columns: [[
	         { field: 'Id', title: 'id', width: 100 },
	         { field: 'Name', title: 'name', width: 100 },
	        ]],
	        pagination: true,
	        rownumbers: true,
	
	        pageList: [3, 6]
	   });
	
	var p = ('#dgd').datagrid('getPager');
	
	(p).pagination({
	        beforePageText: '第',//页数文本框前显示的汉字 
	        afterPageText: '页    共 {pages} 页',
	        displayMsg: '共{total}条数据',
	
	    });
	});

你需要把 ('#dgd').datagrid 方法放置到

	$(function () {
	
	});

如果企图通过其它的 JS 方法来调用 ('#dgd').datagrid 方法，则不会得到正确的分页结果。

可以看到，上面 JS 代码中 url 这一行是被注释掉了。如果我们不需要做别的操作，页面一加载就打算查询出数据，则可以不注释掉该代码。但是，往往，有的时候，url 的参数，如 arg1 的值需要在界面上进行某些操作，然后再通过 JS 代码去得到的，这个时候，就应该注释掉 url，而改由在别的地方赋值，如：

	var step1Ok = function () {
	
	    $('#dgd').datagrid({
	        url: "@ViewBag.Domain/Paper/GetQuestionUnit?arg1=xxx",
	    });
	
	};

在上面的代码中，我们可以假设是点了界面的某个按钮，调用了 step1Ok 这个方法后，才会去 url 查询数据，并呈现到 UI 中去。

二：利用 Ajax 获取数据并填充 Datagrid

如果想追求更大的灵活性，我们可以不使用 datagrid 的默认机制，即指定 url 的方式去获取数据，而是通过 ajax 来获取数据并填充 datagrid。使用这种方式，仍旧需要把 ('#dgd').datagrid 方法放置到

	$(function () {
	
	});

后台代码不变，只不过，点击某个按钮，调用 step1Ok 这个方法，变成了：

    var step1Ok = function () {
    
        .messager.progress(title:′Pleasewaiting′,msg:′Loadingdata...′,text:′PROCESSING.......′);varp=
    
    ('#dgd').datagrid('getPager');
        $(p).pagination({
            onSelectPage: function (pageNumber, pageSize) {
                alert('onSelectPage pageNumber:' + pageNumber + ',pageSize:' + pageSize);
                getData(pageNumber, pageSize);
            }
        });
    
        getData(1,3);
    
    };

第一次调用的时候，将会获取第一页的3条数据：

	getData(1,3);

 



然后我们可以看到，同时，我们还为 pagination 的 onSelectPage 事件创建了一个时间处理器，这样，当改天页面的时候，我们就会去：

getData(pageNumber, pageSize);
另外，由于绕开了 datagrid 的原有机制进行分页，我们采用了自己的遮盖 $.messager.progress，然后在 ajax 的 success 中取消遮盖就可以了。

getData 方法如下：

```javascript
var getData = function (page, rows) {
.ajax({             type: "POST",             url: "@ViewBag.Domain/Paper/GetQuestionUnit",             data: "page=" + page + "&rows=" + rows,             error: function (XMLHttpRequest, textStatus, errorThrown) {                 alert(textStatus);
.messager.progress('close');
    },
    success: function (data) {
        //.each(data,function(i,item)//alert(item);//);

.messager.progress('close');
        $('#dgd').datagrid('loadData', data);

    }
});
};
```