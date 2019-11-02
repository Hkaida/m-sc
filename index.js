//入口文件

const router = require('./router.js');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
//----------------------------------------------------
//启用静态资源服务
app.use(express.static('public'));

//----------------------------------------------------
//处理请求参数
// 挂载参数处理中间件（post）
app.use(bodyParser.urlencoded({ extended: false }));
// 处理json格式的参数
app.use(bodyParser.json());

//----------------------------------------------------
//路由
app.use(router);
//----------------------------------------------------
//启用cookie解析器
app.use(cookieParser());
app.listen(3000, '192.168.43.58',()=>{
    console.log('running...');
});