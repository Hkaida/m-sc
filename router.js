const express = require('express');
//返回单个路由的实例，使用express.Router()避免重复命名
const router = express.Router();
const service = require('./service.js');

//获取首页轮播图
router.get('/getlunbo', service.getLunbo);
//获取商品列表
router.get('/getgoods', service.getGoodsList);
//获取商品详情
//如果参数包含在URL中，例如用:id的方式捕获指定位置的值，捕获的值会填充到req.params
router.get('/getgoodsinfo/:id', service.getGoodsInfo);
//获取商品图文介绍
router.get('/getgoodsdesc', service.getGoodsDesc);
//获取商品分类
router.get('/getCategory', service.getCategory);
//------------------------------------------------------------
//登录
router.post('/signIn', service.signIn);
//注册
router.post('/register', service.register);
//注册查重
router.post('/userNameRepeat', service.unRepeat);
//修改密码
router.post('/changepassword', service.changePassWord);
//退出登录
router.get('/logout', service.logout);
//------------------------------------------------------------
//获取购物车
router.get('/getshopcar', service.getShopCar);
//添加购物车
router.post('/addToShopcar', service.addToShopCar);
//删除购物车
router.post('/delShopcar', service.delShopCar);
//修改购物车商品数据
router.post('/updateCount', service.updateCount);

module.exports = router;