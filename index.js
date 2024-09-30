const PORT = 8080; // 개발 테스트용 포트
const express = require('express'); //express 모듈을 가져옴
const database = require('./database/database');
const cors = require('cors');
const app = express(); //express 기능 app에 담기
const path = require('path');
const spawn = require('child_process').spawn;

app.use(express.json()); // express에 json 사용

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World http test completed');
});

app.get('/test_db', async (req, res) => {
  try {
    const result = await database.query('SELECT * FROM TEST_DB');
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 채팅 문자열 요청
app.post('/chat', (req, res) => {
  try {
    const sendedQuestion = req.body.question;

    // EC2 서버에서 현재 실행 중인 Node.js 파일의 절대 경로를 기준으로 설정.
    const scriptPath = path.join(__dirname, 'bizchat.py');

    // ec2 서버에서 실행하는 절대 경로: 개발 테스트 시 사용 불가
    // const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');

    // 윈도우 개발 테스트 시 사용하는 절대 경로
    const pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');

    // Spawn the Python process with the correct argument
    const result = spawn(pythonPath, [scriptPath, sendedQuestion]);
    let responseData = '';

    // Listen for data from the Python script
    result.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    // Listen for errors from the Python script
    result.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.status(500).json({ error: data.toString() });
    });

    // Handle the close event of the child process
    result.on('close', (code) => {
      if (code === 0) {
        res.status(200).json({ answer: responseData });
      } else {
        res
          .status(500)
          .json({ error: `Child process exited with code ${code}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use(require('./routes/getRoutes'));
app.use(require('./routes/postRoutes'));
app.use(require('./routes/deleteRoutes'));
app.use(require('./routes/updateRoutes'));

app.listen(PORT, () => console.log(`server is running on port ${PORT}`)); // 서버가 돌아가는지 확인하는 코드
