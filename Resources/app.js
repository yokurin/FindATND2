// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

var win1 = Ti.UI.createWindow({
	title: 'ATND検索',
	backgroundColor: '#fff'
});

var tab1 = Ti.UI.createTab({
	icon:'KS_nav_views.png',
	title:'ATND検索', 
	window: win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	top: 10,
	text:'キーワードを入力してください',
	//font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});
win1.add(label1);

//キーワードを入力するテキストフィールド
var textField1 = Ti.UI.createTextField({
	value: '',
	hintText: '例:android',
	top: 35,
	width: '70%',
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	//スペル機能をオフ
	autocorrect: false,
	//自動大文字化機能を無効
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
});
win1.add(textField1);

win1.addEventListener('focus', function(e){
	textField1.focus();
});



var win2 = Ti.UI.createWindow({
	title:'検索結果',
	backgroundColor: '#fff'
});

var tab2 = Ti.UI.createTab({
	icon:'KS_nav_views.png',
	title:'検索結果', 
	window: win2
});

//一度に表示する行数
const ROW_IN_PAGE = 7;
var startPos = 1;
var findword = '';

var myTemplate = {
	properties:{
		height: '70dp',
		accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	},
	childTemplates:[
		{
			type: 'Ti.UI.Label',
			bindId: 'eventId',
			properties:{
				top:'5dp',
				left:'5dp',
				font:{fontSize: '10dp'}
			}
		},
		{
			type: 'Ti.UI.Label',
			bindId: 'address',
			properties:{
				top:'4dp',
				left:'70dp',
				font:{fontSize: '10dp'}
			}
		},
		{
			type: 'Ti.UI.Label',
			bindId: 'startedAt',
			properties:{
				top:'20dp',
				left:'70dp',
				font:{fontSize: '10dp'}
			}
		},
		{
			type: 'Ti.UI.Label',
			bindId: 'title',
			properties:{
				top:'38dp',
				left:'70dp',
				font:{fontSize: '15dp', fontWeight:'bold'},
				color: 'blue'
			}
		}
	]
};
var refControl = Ti.UI.createRefreshControl({
	tintColor: 'blue' //更新時のくるくるの色を指定
});


var listView = Ti.UI.createListView({
	templates: { 'template': myTemplate},
	defaultItemTemplate: 'template',
	refreshControl:refControl
});


var data = [];

var button1 = Ti.UI.createButton({
		title: '検索',
		top: 75,
		//backgroundColor: '#aaa',
		width: '100',
		height: '30'
		//left: 210
});
button1.addEventListener('click', function(e){
	var findword = textField1.value;
	if(findword.length === 0)
	{
		alert('検索ワードを入力してください');
		return;
	}
	startPos = 1;
	data = [];
	getJsonData();
});
win1.add(button1);


function getJsonData()
{
		//encodeURIComponent 文字列を完全なURI形式にエンコードする
	var url = 'http://api.atnd.org/events/?keyword=' + encodeURIComponent(findword) + '&count=' + ROW_IN_PAGE + '&start='+ startPos + '&format=json';
	var client = Ti.Network.createHTTPClient({
		onload: function(e)
		{
			Ti.API.info('受けとったテキスト：'+this.responseText);
			
			try{
				//JSONパース
				var jsondata = JSON.parse(this.responseText);
				//console.log(jsondata);
				jsonToRow(jsondata);
				tabGroup.activeTab = 1;
			}catch(err){
				alert('JSON変換エラー：' + err.message);
			}
		},
		onerror:function(e)
		{
			Ti.API.debug(e.error);
		},
		timeout: 5000
		
	});
	
	//GETで取得
	client.open('GET', url);
	//http getを実行
	client.send();	
}


/*
//下にデータが追加される
function jsonToRow(jsondata)
{
	console.log('jsondata----' + JSON.stringify(jsondata));
	//行データの作成
	for(var i=0; i<jsondata.results_returned; i++)
	{
		var rowdata = jsondata.events[i].event;
		
		data.push({
			eventId: { text: rowdata.event_id },
			title: { text: rowdata.title},
			startedAt: { text: rowdata.started_at },
			address: { text: rowdata.address }
		});

	}
	
	var section = Ti.UI.createListSection({items:data});
	listView.sections = [section];
}
*/

function jsonToRow(jsondata)
{
	console.log('jsondata----' + JSON.stringify(jsondata));
	//行データの作成
	var tmpData = [];
	for(var i=jsondata.results_returned; i>0 ; i--)
	{	
		//取得したデータを逆順にtmpdataにいれる
		var rowdata = jsondata.events[i-1].event;
		
		if(!rowdata.address || rowdata.address == null)
		{
			rowdata.address = '地球のどこかw';
		}
		
		tmpData.push({
			eventId: { text: rowdata.event_id },
			title: { text: rowdata.title},
			startedAt: { text: rowdata.started_at },
			address: { text: rowdata.address }
		});
	}
	
	data = tmpData.concat(data);

	var section = Ti.UI.createListSection({items:data});
	listView.sections = [section];
}


win2.add(listView);

refControl.addEventListener('refreshstart', function(e){
	startPos = startPos + ROW_IN_PAGE;
	getJsonData();
	refControl.endRefreshing();
});

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
