const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProjectRestore {
    constructor() {
        this.projectPath = process.cwd();
        this.backupFolder = path.join(this.projectPath, '.backups');
    }

    // 오늘 날짜의 백업 찾기
    findTodayBackup() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        console.log(`🔍 ${today} 날짜의 백업을 찾는 중...`);
        
        try {
            const commits = execSync(`git log --since="${today} 00:00" --until="${today} 23:59" --oneline`, 
                { encoding: 'utf8' });
            
            if (commits.trim()) {
                console.log('📋 오늘의 커밋 목록:');
                console.log(commits);
                return commits.split('\n').filter(line => line.trim());
            }
        } catch (error) {
            console.log('❌ Git 로그를 가져올 수 없습니다:', error.message);
        }
        
        return [];
    }

    // 모든 최근 커밋 보기 (상세 메시지 포함)
    findRecentCommits(count = 30) {
        console.log(`🔍 최근 ${count}개 커밋을 찾는 중...`);
        
        try {
            // 더 자세한 정보를 위해 --pretty 옵션 사용
            const commits = execSync(`git log --pretty=format:"%h - %s (%cr)" -${count}`, { encoding: 'utf8' });
            
            if (commits.trim()) {
                console.log('📋 최근 커밋 목록 (상세):');
                const commitList = commits.split('\n').filter(line => line.trim());
                
                commitList.forEach((commit, index) => {
                    console.log(`  ${index + 1}. ${commit}`);
                });
                
                return commitList;
            }
        } catch (error) {
            console.log('❌ Git 로그를 가져올 수 없습니다:', error.message);
        }
        
        return [];
    }

    // 4대보험 관련 커밋 찾기
    findInsuranceCommits() {
        console.log('🔍 4대보험 관련 커밋들을 찾는 중...');
        
        try {
            const commits = execSync(`git log --oneline --grep="보험" --grep="insurance" --grep="차트" --grep="요율" -i`, { encoding: 'utf8' });
            
            if (commits.trim()) {
                console.log('📋 4대보험 관련 커밋들:');
                const commitList = commits.split('\n').filter(line => line.trim());
                
                commitList.forEach((commit, index) => {
                    console.log(`  ${index + 1}. ${commit}`);
                });
                
                return commitList;
            } else {
                console.log('❌ 4대보험 관련 커밋을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.log('❌ Git 로그를 가져올 수 없습니다:', error.message);
        }
        
        return [];
    }

    // 특정 날짜 범위의 커밋 찾기
    findCommitsByDateRange(days = 7) {
        console.log(`🔍 최근 ${days}일간의 커밋을 찾는 중...`);
        
        try {
            const commits = execSync(`git log --since="${days} days ago" --oneline`, { encoding: 'utf8' });
            
            if (commits.trim()) {
                console.log('📋 최근 일주일간 커밋 목록:');
                const commitList = commits.split('\n').filter(line => line.trim());
                
                commitList.forEach((commit, index) => {
                    console.log(`  ${index + 1}. ${commit}`);
                });
                
                return commitList;
            }
        } catch (error) {
            console.log('❌ Git 로그를 가져올 수 없습니다:', error.message);
        }
        
        return [];
    }

    // 주요 버전들 찾기
    findVersionCommits() {
        console.log('🔍 주요 버전 커밋들을 찾는 중...');
        
        try {
            const commits = execSync(`git log --oneline --grep="v\\." --grep="버전" --grep="백업" -i`, { encoding: 'utf8' });
            
            if (commits.trim()) {
                console.log('📋 주요 버전들:');
                const commitList = commits.split('\n').filter(line => line.trim());
                
                commitList.forEach((commit, index) => {
                    console.log(`  ${index + 1}. ${commit}`);
                });
                
                return commitList;
            }
        } catch (error) {
            console.log('❌ Git 로그를 가져올 수 없습니다:', error.message);
        }
        
        return [];
    }

    // 특정 커밋으로 복원
    restoreToCommit(commitHash) {
        try {
            console.log(`🔄 ${commitHash}로 복원 중...`);
            
            // 현재 변경사항 스태시 (있다면)
            try {
                execSync('git stash push -m "auto-stash-before-restore"');
                console.log('📦 현재 변경사항을 임시 저장했습니다.');
            } catch (e) {
                console.log('📝 저장할 변경사항이 없습니다.');
            }
            
            // 지정된 커밋으로 복원
            execSync(`git reset --hard ${commitHash}`);
            console.log(`✅ ${commitHash}로 성공적으로 복원되었습니다!`);
            
            // 현재 상태 확인
            const currentHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            const currentMessage = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
            
            console.log(`📍 현재 위치: ${currentMessage}`);
            
            return true;
            
        } catch (error) {
            console.log('❌ 복원 실패:', error.message);
            return false;
        }
    }

    // PayPulse 특정 복원 (5d284172)
    restoreToGoodState() {
        console.log('🎯 PayPulse를 좋은 상태(5d284172)로 복원합니다...');
        return this.restoreToCommit('5d284172');
    }

    // 백업 생성
    createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupMessage = `백업 - ${timestamp}`;
            
            execSync(`git add .`);
            execSync(`git commit -m "${backupMessage}"`);
            
            console.log(`✅ 백업 생성됨: ${backupMessage}`);
            return true;
        } catch (error) {
            console.log('❌ 백업 생성 실패:', error.message);
            return false;
        }
    }

    // 현재 상태 확인
    checkCurrentState() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            const currentCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
            
            console.log('📍 현재 상태:');
            console.log(`   커밋: ${currentCommit}`);
            console.log(`   변경사항: ${status.trim() ? '있음' : '없음'}`);
            
            if (status.trim()) {
                console.log('📋 변경된 파일들:');
                console.log(status);
            }
            
        } catch (error) {
            console.log('❌ 상태 확인 실패:', error.message);
        }
    }
}

// 메인 실행
function main() {
    console.log('🚀 PayPulse 프로젝트 복원 도구');
    console.log('=====================================');
    
    const restore = new ProjectRestore();
    
    // 현재 상태 확인
    restore.checkCurrentState();
    console.log('');
    
    // 다양한 커밋 목록 보기
    console.log('📋 다양한 복원 시점들:');
    console.log('');
    
    // 1. 4대보험 관련 커밋들 (우선 표시)
    const insuranceCommits = restore.findInsuranceCommits();
    console.log('');
    
    // 2. 최근 30개 커밋 (상세 정보)
    const recentCommits = restore.findRecentCommits(30);
    console.log('');
    
    // 3. 주요 버전들
    const versionCommits = restore.findVersionCommits();
    console.log('');
    
    console.log('🎯 복원 방법:');
    console.log('   1. 수동 복원: git reset --hard <커밋해시>');
    console.log('   2. 스크립트 복원: node restore.js <커밋해시>');
    console.log('');
    console.log('📍 추천 시점들:');
    console.log('   - 52bff82f: v.1.2 (깔끔한 기본 상태)');
    console.log('   - [찾는 중]: 4대보험 요율 차트 완료 직후 (목표 시점!)');
    console.log('   - 5d284172: 오늘 모든 작업 완료 (기능 많음, 문제도 많음)');
    console.log('   - 2c16e64f: 최신 상태 (문제 매우 많음)');
    console.log('');
    console.log('🎯 4대보험 요율 직후 시점 특징:');
    console.log('   ✅ 심박수 로고 + 4대보험 차트');
    console.log('   ❌ 복잡한 계산기나 업로드 시스템 없음');
    console.log('');
    
    // 명령줄 인수에서 커밋 해시 확인
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const commitHash = args[0];
        console.log(`🎯 ${commitHash}로 복원 시작...`);
        const success = restore.restoreToCommit(commitHash);
        
        if (success) {
            console.log('');
            console.log('🎉 복원 완료!');
            console.log('💡 브라우저에서 index.html을 열어 확인해보세요!');
        } else {
            console.log('');
            console.log('❌ 복원 실패!');
        }
    } else {
        console.log('💡 사용법:');
        console.log('   node restore.js              # 커밋 목록만 보기');
        console.log('   node restore.js <해시>       # 특정 커밋으로 복원');
        console.log('');
        console.log('💡 4대보험 요율 직후 시점 찾는 방법:');
        console.log('   1. 위의 4대보험 관련 커밋들 확인');
        console.log('   2. 최근 커밋 목록에서 시간순 확인');
        console.log('   3. "보험", "차트", "요율" 키워드가 있는 커밋 선택');
    }
}

// 실행
if (require.main === module) {
    main();
}

module.exports = ProjectRestore;