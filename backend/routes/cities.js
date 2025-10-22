import express from 'express';
const router = express.Router();
import { getCities, getCity, searchCities, getHotCities, getCityStats } from '../controllers/cityController.js';

// 获取城市列表
router.get('/', getCities);

// 获取热门城市
router.get('/hot', getHotCities);

// 获取城市详情
router.get('/:id', getCity);

// 获取城市区县
router.get('/:id/districts', getCityStats);

// 搜索城市 - 支持查询参数和路径参数两种方式
router.get('/search/:keyword?', searchCities);

export default router;