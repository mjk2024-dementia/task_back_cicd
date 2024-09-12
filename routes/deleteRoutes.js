const router = require('express').Router();
const {deleteTask} = require('../controllers/deleteTask');

router.delete('/delete_task/:itemId', deleteTask); //컨트롤 함수 연결 :은 정해지지 않은 문자열 표시

module.exports = router; //router 모듈 내보내기