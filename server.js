 const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// SafeJSONParser 클래스 - NaN, undefined, Infinity 등을 안전하게 처리
class SafeJSONParser {
    static parse(jsonString) {
        try {
            // NaN을 null로 변환
            const cleanedJson = jsonString
                .replace(/:\s*NaN/g, ': null')
                .replace(/:\s*undefined/g, ': null')
                .replace(/:\s*Infinity/g, ': null')
                .replace(/:\s*-Infinity/g, ': null')
                .replace(/,\s*}/g, '}')  // 마지막 쉼표 제거
                .replace(/,\s*]/g, ']'); // 배열 마지막 쉼표 제거
            
            return JSON.parse(cleanedJson);
        } catch (error) {
            console.error('SafeJSONParser 오류:', error.message);
            throw new Error(`JSON 파싱 오류: ${error.message}`);
        }
    }
}

// uploads 디렉토리 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 정적 파일 서빙
    if (pathname === '/') {
        serveStaticFile('./index.html', res);
        return;
    }

    // 기타 정적 파일들
    if (pathname.endsWith('.html') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.json')) {
        serveStaticFile('.' + pathname, res);
        return;
    }

    // API 엔드포인트 처리
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname);
        return;
    }

    // 정적 파일 서빙
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// API 요청 핸들러
function handleApiRequest(req, res, pathname) {
    console.log(`API 요청: ${req.method} ${pathname}`);

    if (pathname === '/api/payroll/upload' && req.method === 'POST') {
        handlePayrollUpload(req, res);
    } else if (pathname === '/api/payroll/list' && req.method === 'GET') {
        handlePayrollList(req, res);
    } else if (pathname === '/api/payroll/delete' && req.method === 'DELETE') {
        handlePayrollDelete(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API 엔드포인트를 찾을 수 없습니다.' }));
    }
}

// 급여 데이터 업로드 처리
function handlePayrollUpload(req, res) {
    let body = '';
    let chunks = [];

    req.on('data', chunk => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        try {
            // multipart/form-data가 아닌 JSON 직접 업로드 처리
            if (req.headers['content-type']?.includes('application/json')) {
                const jsonData = Buffer.concat(chunks).toString();
                processJsonUpload(jsonData, res);
                return;
            }

            // 일반 FormData 처리 (간단한 구현)
            const boundary = req.headers['content-type']?.split('boundary=')[1];
            if (boundary) {
                const data = Buffer.concat(chunks);
                parseMultipartData(data, boundary, res);
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '지원하지 않는 콘텐츠 타입입니다.' }));
            }
        } catch (error) {
            console.error('업로드 처리 오류:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '서버 오류가 발생했습니다.' }));
        }
    });

    req.on('error', (error) => {
        console.error('요청 오류:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다.' }));
    });
}

// JSON 데이터 직접 업로드 처리
function processJsonUpload(jsonData, res) {
    try {
        console.log('JSON 직접 업로드 처리 시작');
        
        const uploadData = SafeJSONParser.parse(jsonData);
        console.log('파싱된 데이터 구조:', typeof uploadData, Array.isArray(uploadData));
        console.log('uploadData 키:', Object.keys(uploadData));
        
        // 새로운 형식 (fileName과 data 포함) 또는 기존 형식 처리
        let payrollData, originalFileName;
        
        if (uploadData.fileName && uploadData.data) {
            // 새로운 형식: {fileName: "file.json", data: [...]}
            payrollData = uploadData.data;
            originalFileName = uploadData.fileName;
            console.log('파일명 포함 업로드:', originalFileName, '데이터 길이:', payrollData.length);
        } else {
            // 기존 형식: 직접 배열 데이터
            payrollData = uploadData;
            originalFileName = null;
            console.log('직접 배열 업로드, 타입:', typeof payrollData, '배열 여부:', Array.isArray(payrollData));
        }
        
        // 데이터 검증
        if (!Array.isArray(payrollData)) {
            throw new Error('올바른 배열 형태가 아닙니다.');
        }

        if (payrollData.length === 0) {
            throw new Error('빈 데이터입니다.');
        }

        // 급여 데이터 필수 필드 검증
        const requiredFields = ['사번', '성명'];
        const firstRecord = payrollData[0];
        const hasRequiredFields = requiredFields.some(field => field in firstRecord);
        
        if (!hasRequiredFields) {
            console.warn('필수 필드가 없지만 계속 진행합니다.');
        }

        // 데이터를 파일로 저장
        let fileName;
        if (originalFileName) {
            // 원본 파일명 사용 (시간 스탬프 추가)
            const ext = path.extname(originalFileName);
            const baseName = path.basename(originalFileName, ext);
            fileName = `${baseName}_${Date.now()}${ext}`;
        } else {
            // 기본 파일명 생성
            fileName = `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`;
        }
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(payrollData, null, 2));
        
        console.log(`급여 데이터 저장 완료: ${fileName}, 레코드 수: ${payrollData.length}`);

        // 성공 응답
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: '업로드 성공',
            recordCount: payrollData.length,
            fileName: fileName,
            savedAt: new Date().toISOString()
        }));

    } catch (error) {
        console.error('JSON 처리 오류:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false,
            error: `JSON 처리 오류: ${error.message}` 
        }));
    }
}

// 간단한 multipart 데이터 파싱 (기본 구현)
function parseMultipartData(data, boundary, res) {
    try {
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const parts = [];
        let start = 0;
        
        // 경계 찾기
        while (true) {
            const boundaryIndex = data.indexOf(boundaryBuffer, start);
            if (boundaryIndex === -1) break;
            
            if (start !== 0) {
                parts.push(data.slice(start, boundaryIndex));
            }
            start = boundaryIndex + boundaryBuffer.length;
        }

        // 파일 데이터 추출
        for (const part of parts) {
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;
            
            const headers = part.slice(0, headerEnd).toString();
            const fileData = part.slice(headerEnd + 4);
            
            if (headers.includes('filename=') && headers.includes('.json')) {
                const jsonContent = fileData.toString().trim();
                if (jsonContent) {
                    processJsonUpload(jsonContent, res);
                    return;
                }
            }
        }
        
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '파일을 찾을 수 없습니다.' }));
        
    } catch (error) {
        console.error('Multipart 파싱 오류:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Multipart 처리 오류' }));
    }
}

// 업로드된 파일 목록 조회
function handlePayrollList(req, res) {
    try {
        const files = fs.readdirSync(uploadsDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    fileName: file,
                    size: stats.size,
                    uploadedAt: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, files }));
    } catch (error) {
        console.error('파일 목록 조회 오류:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '파일 목록을 불러올 수 없습니다.' }));
    }
}

// 파일 삭제
function handlePayrollDelete(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const { fileName } = SafeJSONParser.parse(body);
            const filePath = path.join(uploadsDir, fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: '파일이 삭제되었습니다.' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '파일을 찾을 수 없습니다.' }));
            }
        } catch (error) {
            console.error('파일 삭제 오류:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '파일 삭제 중 오류가 발생했습니다.' }));
        }
    });
}

// 정적 파일 서빙 함수
function serveStaticFile(filePath, res) {
    try {
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('파일을 찾을 수 없습니다.');
            return;
        }

        const ext = path.extname(filePath);
        let contentType = 'text/plain';

        switch (ext) {
            case '.html':
                contentType = 'text/html; charset=utf-8';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.json':
                contentType = 'application/json';
                break;
        }

        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        console.error('정적 파일 서빙 오류:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('서버 오류가 발생했습니다.');
    }
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('API endpoints available:');
    console.log('  POST /api/payroll/upload - 급여 데이터 업로드');
    console.log('  GET  /api/payroll/list   - 업로드된 파일 목록');
    console.log('  DELETE /api/payroll/delete - 파일 삭제');
    console.log('Press Ctrl+C to stop the server');
}); 