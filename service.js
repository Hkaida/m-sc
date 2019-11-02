const fs = require('fs');
const path = require('path');
const baseData = require('./baseData.json');
const goodsData = require('./goodsData.json');
const userData = require('./userData.json');

var getCookie = (queryStr, req) => {
							//queryStr是要提取的数据名，
							let data = [];
							let result = {};

							data = decodeURI(req.headers.cookie)
								.replace(/%3A/g,":")
								.replace(/%2C/g,",")
								.replace(/%2F/g,"/")
								.split("; ");

							data.some(item => {
								if(item.slice(0, queryStr.length) == queryStr){
									result = JSON.parse(item.slice(queryStr.length + 3));
									return true;
								}
							});
							return result;
			}

//获取首页轮播图
exports.getLunbo = (req, res) => {
	let data = { message: baseData.lunbo };
	res.send(data);
}
//获取商品列表
exports.getGoodsList = (req, res) => {
	//get请求，URL是 /getgoods?pageindex=1 获取参数用req.query，格式为{ pageindex: 1 }
	let index = req.query.pageindex;
	let data = { message:[] };
	for(let i= (index-1) * 4; i < (index-1) * 4 + 4; i++){
		if( i >= goodsData.length){
			break;
		}
		//因为需要删除一些不需要的数据，为了不影响原数据导致影响其他函数调用原数据
		//所以需要深拷贝一份
		let copy = { ...goodsData[i] };
		data.message.push(copy); 
	}
	if(data.length != 0){
		data.message.forEach(item => {
			delete item.lunbo;
			delete item.goodsNo;
		});
	}
	res.send(data);
}
//获取商品详情
exports.getGoodsInfo = (req, res) => {
	//获取商品id
	let id = req.params.id;
	goodsData.some(item => {
		if( item.id == id ){
			let data = { message: { ...item } };
			res.send(data);
			return true;
		}
	});	
}
//获取商品图文介绍，待完善
exports.getGoodsDesc = (req, res) => {
	
	res.send({ status: 0 });
}
//获取商品分类列表
exports.getCategory = (req, res) => {
	let data = { message: [] };
	goodsData.forEach( item => {
		var flag = true; 
		data.message.some(item2 => {
			if(item2.categoryName == item.brand){
				item2.goodsList.push({img: item.img, name: item.name});
				flag = false;
				return true
			}
		});
		if(flag){
			data.message.push({ 
				categoryName: item.brand, 
				goodsList: [{img: item.img, name: item.name}] 
			});
		}
	});
	//凑数-------------------------
		data.message.forEach(item => {
			let num = 3;
			if(item.categoryName == "华为"){
				num = 1;
			}
			for(let i=0; i < num; i++){
				item.goodsList = item.goodsList.concat(item.goodsList)
			}
		});
		data.message = data.message.concat(data.message);
	//-----------------------------
	res.send(data);
}

//登录
exports.signIn = (req, res) => {
	//post请求，获取参数req.body，格式为{ user: '达达', password: '123456' }
	console.log(req.body);

	let flag = false;//登录成功或失败
	userData.some( item => {
		if(item.user == req.body.user && item.password == req.body.password){
			// {
			// 		user: item.user,
			// 		headImg: item.headImg,
			// 		sex: item.sex
			// 	}
			//------------------------------+
			//把用户信息临时存在cookie
			
			let data = {
			 		user: item.user,
			 		headImg: item.headImg,
			 		sex: item.sex
			 	};
			res.cookie('user', data);
			//------------------------------+
			//数据也要返回用户信息，这个和写cookie不是同步执行的，所以前端要依靠res.send返回的数据才能第一时间准确得到
			 res.send({ 
				status: 0 ,
				message:{
					user: item.user,
					headImg: item.headImg,
					sex: item.sex
				}
			});
			flag = true;
			return true
		}
	});
	if( flag == false ){ //用户名或密码错误
		res.send({ status: 1 });
	}
}
//注册
exports.register = (req, res) => {
	console.log(req.body);
	let flag = true; //默认用户名未注册
	// userData.some( item => { //查重操作未来需要换到另一个查重请求函数中
	// 	if( req.body.user == item.user){
	// 		res.send({ status: 1});
	// 		flag = false
	// 		return true;
	// 	}
	// });
	if (flag) {
		console.log("写文件");
		//创建用户信息模板
		let u = {
				"user": "",
				"password": 123456,
				"mibao": "",
				"headImg": "../src/images/imgList1.jpg",
				"sex": "男",
				"car": []
				}
		u.user = req.body.user;
		u.password = req.body.password;
		u.mibao = req.body.mibao;
		//修改内存中的userData数据
		userData.push(u);
		//把内存中的userData覆盖到硬盘中的userData.json
		fs.writeFile(path.join(__dirname,'userData.json'),JSON.stringify(userData,null,4),(err)=>{
			if(err){
				res.send('未知错误');
			}
			res.send({ status: 0});
		});
		
	}
}
//注册查重
exports.unRepeat = (req, res) => {
	let flag = true; //默认用户名未注册
	userData.some( item => { //查重操作未来需要换到另一个查重请求函数中
		if( req.body.user == item.user){
			res.send({ status: 1});
			flag = false;
			return true;
		}
	});
	if(flag){
		res.send({ status: 0});
	}
}
//修改密码,待添加参数分析
exports.changePassWord = (req, res) => {
	//从cookie中读取修改密码的用户，需要解码
	//let cookieUser = req.headers.cookie.slice(9);
	//cookieUser = JSON.parse(decodeURI(cookieUser).replace(/%3A/g,": ").replace(/%2C/g,", ").replace(/%2F/g,"/"));
	let cookieUser = getCookie("user", req);
	//获取验证信息
	let newData = req.body;
	console.log(newData);
	//遍历找到用户，判断旧密码和密保是否正确
	userData.some(item => {
		if(cookieUser.user == item.user) {
			if( item.password != newData.oldPassword ){
				console.log(item.password);
				console.log(newData.oldPassword);
				res.send({ status: 1});
			} else if (item.mibao != newData.mibao){
				res.send({ status: 2});
			} else {
				//如果正确则修改用户密码，然后写入userData.json文件
				item.password = newData.newPassword;
				fs.writeFile(path.join(__dirname,'userData.json'),JSON.stringify(userData,null,4),(err)=>{
					if(err){
						res.send('未知错误');
					}
					//修改完密码需要重新登录，清除cookie
					res.clearCookie('user');
					res.send({ status: 0});
				});
				
			}
			return true
		}
	});
}
//退出登录
exports.logout = (req, res) => {
	//用 req.headers.cookie 读取cookie
	//console.log(req.headers.cookie);
	//清除cookie
	res.clearCookie("user");
	res.clearCookie("car");
	res.send({ status: 0});
}
//获取购物车数据
exports.getShopCar = (req, res) => {
	//req.headers.cookie.slice(9);
	//let user = req.query;
	let userCookie = getCookie("user", req);
	let flag = true;
	userData.some(item => {
		if(item.user == userCookie.user){
			res.cookie('car', item.car);
			res.send({ status: 0,
						message: item.car
					});
			flag = false;
			return true
		}
	});
	if(flag){
		res.send( {status: 1} );
	}
}
//添加购物车,待添加写文件操作
exports.addToShopCar = (req, res) => {
	console.log("添加购物车");
	console.log(req.body);
	let goods = req.body;
	//获取商品数据
	goodsData.some(item => {
		if (item.id == goods.id){
			goods.count = parseInt(goods.count);
			goods.brand = item.brand;
			goods.title = item.title;
			goods.price = item.nowPrice;
			goods.thumb = item.lunbo[0].img
			return true
		}
	});
	let userCookie = getCookie("user", req);
	userData.some(item => {
		if( userCookie.user == item.user ){
			let flag = true;
			item.car.some(item2 => {
				if (item2.id == goods.id) {
					item2.count = parseInt(item2.count) + parseInt(goods.count);
					flag = false;
				}
			});
			if(flag){
				item.car.push(goods);
			}
			fs.writeFile(path.join(__dirname,'userData.json'),JSON.stringify(userData,null,4),(err)=>{
					if(err){
						res.send({ status: 1 });
					}
				res.cookie('car', item.car);
				res.send({ status: 0 });
			});
		}
		return true;
	});
	
}
//删除购物车数据
exports.delShopCar = (req, res) => {
	console.log("删除购物车");
	let userCookie = getCookie("user", req);
	userData.some(item => {
		if( userCookie.user == item.user ){
			item.car.some(item2 => {
				if(item2.id == req.body.id){
					item.car.splice(item.car.indexOf(item2), 1);
					return true
				}
			});
		}
		fs.writeFile(path.join(__dirname,'userData.json'),JSON.stringify(userData,null,4),(err)=>{
						if(err){
							res.send({ status: 1 });
						}
					res.cookie('car', item.car);
					res.send({ status: 0 });
					});
		return true
	});
}
//修改购物车商品数量
exports.updateCount = (req, res) => {
	console.log("修改购物车商品数量");
	console.log(req.body);
	let userCookie = getCookie("user", req);
	userData.some(item => {
		if( userCookie.user == item.user ){
			item.car.some(item2 => {
				if(item2.id == req.body.id){
					item2.count = parseInt(req.body.count);
					return true
				}
			});
		}
		fs.writeFile(path.join(__dirname,'userData.json'),JSON.stringify(userData,null,4),(err)=>{
			if(err){
				res.send({ status: 1 });
			}
			res.cookie('car', item.car);
			res.send({ status: 0 });
		});
		return true
	});
} 