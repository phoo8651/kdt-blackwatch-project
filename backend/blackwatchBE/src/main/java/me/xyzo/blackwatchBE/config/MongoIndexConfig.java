package me.xyzo.blackwatchBE.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexInfo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class MongoIndexConfig implements ApplicationRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            createLeakedDataIndexes();
            createVulnerabilityDataIndexes();
            createContributorSessionIndexes();
            createChallengeIndexes();
            createSessionIndexes();
            createRequestIndexes();
            createCredentialIndexes();
        } catch (Exception e) {
            System.out.println("Index creation completed with some existing indexes: " + e.getMessage());
        }
    }

    private void createLeakedDataIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_leaked");

            // 기존 인덱스 정보 확인
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            // host 인덱스 생성 (기존에 없는 경우만)
            if (!hasIndexForField(existingIndexes, "host")) {
                indexOps.ensureIndex(new Index().on("host", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // title 인덱스 생성
            if (!hasIndexForField(existingIndexes, "title")) {
                indexOps.ensureIndex(new Index().on("title", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // author 인덱스 생성
            if (!hasIndexForField(existingIndexes, "author")) {
                indexOps.ensureIndex(new Index().on("author", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // uploadDate 인덱스 생성
            if (!hasIndexForField(existingIndexes, "uploadDate")) {
                indexOps.ensureIndex(new Index().on("uploadDate", org.springframework.data.domain.Sort.Direction.DESC));
            }

            // recordsCount 인덱스 생성
            if (!hasIndexForField(existingIndexes, "recordsCount")) {
                indexOps.ensureIndex(new Index().on("recordsCount", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // 개인정보 검색용 인덱스
            if (!hasIndexForField(existingIndexes, "leaked.email")) {
                indexOps.ensureIndex(new Index().on("leaked.email", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "leaked.realname")) {
                indexOps.ensureIndex(new Index().on("leaked.realname", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "leaked.username")) {
                indexOps.ensureIndex(new Index().on("leaked.username", org.springframework.data.domain.Sort.Direction.ASC));
            }
        } catch (Exception e) {
            System.out.println("Some leaked data indexes already exist: " + e.getMessage());
        }
    }

    private void createVulnerabilityDataIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_vulnerability");
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            // 기본 검색용 인덱스
            if (!hasIndexForField(existingIndexes, "host")) {
                indexOps.ensureIndex(new Index().on("host", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "title")) {
                indexOps.ensureIndex(new Index().on("title", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "author")) {
                indexOps.ensureIndex(new Index().on("author", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "uploadDate")) {
                indexOps.ensureIndex(new Index().on("uploadDate", org.springframework.data.domain.Sort.Direction.DESC));
            }

            // CVE 검색용 인덱스
            if (!hasIndexForField(existingIndexes, "cveIds")) {
                indexOps.ensureIndex(new Index().on("cveIds", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // CVSS 범위 검색용 인덱스
            if (!hasIndexForField(existingIndexes, "cvss")) {
                indexOps.ensureIndex(new Index().on("cvss", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // 취약점 분류 검색용 인덱스
            if (!hasIndexForField(existingIndexes, "vulnerabilityClass")) {
                indexOps.ensureIndex(new Index().on("vulnerabilityClass", org.springframework.data.domain.Sort.Direction.ASC));
            }
        } catch (Exception e) {
            System.out.println("Some vulnerability data indexes already exist: " + e.getMessage());
        }
    }

    private void createContributorSessionIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("contributor_sessions");
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            // 세션 관리용 인덱스
            if (!hasIndexForField(existingIndexes, "userId")) {
                indexOps.ensureIndex(new Index().on("userId", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "clientId")) {
                indexOps.ensureIndex(new Index().on("clientId", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "expiresAt")) {
                indexOps.ensureIndex(new Index().on("expiresAt", org.springframework.data.domain.Sort.Direction.ASC)
                        .expire(0, TimeUnit.SECONDS)); // TTL 인덱스
            }

            if (!hasIndexForField(existingIndexes, "isActive")) {
                indexOps.ensureIndex(new Index().on("isActive", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // 복합 인덱스 (중복 체크가 복잡하므로 try-catch로 처리)
            try {
                indexOps.ensureIndex(new Index()
                        .on("userId", org.springframework.data.domain.Sort.Direction.ASC)
                        .on("isActive", org.springframework.data.domain.Sort.Direction.ASC)
                        .on("expiresAt", org.springframework.data.domain.Sort.Direction.DESC));
            } catch (Exception e) {
                // 복합 인덱스가 이미 존재하는 경우 무시
            }
        } catch (Exception e) {
            System.out.println("Some contributor session indexes already exist: " + e.getMessage());
        }
    }

    private void createChallengeIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_challenge");
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            if (!hasIndexForField(existingIndexes, "clientId")) {
                indexOps.ensureIndex(new Index().on("clientId", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // expiresAt은 TTL 인덱스로 이미 존재할 가능성이 높으므로 체크 후 생성
            if (!hasIndexForField(existingIndexes, "expiresAt")) {
                indexOps.ensureIndex(new Index().on("expiresAt", org.springframework.data.domain.Sort.Direction.ASC)
                        .expire(0, TimeUnit.SECONDS));
            }
        } catch (Exception e) {
            System.out.println("Some challenge indexes already exist: " + e.getMessage());
        }
    }

    private void createSessionIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_sessions");
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            if (!hasIndexForField(existingIndexes, "clientId")) {
                indexOps.ensureIndex(new Index().on("clientId", org.springframework.data.domain.Sort.Direction.ASC));
            }

            if (!hasIndexForField(existingIndexes, "userId")) {
                indexOps.ensureIndex(new Index().on("userId", org.springframework.data.domain.Sort.Direction.ASC));
            }

            // expiresAt TTL 인덱스
            if (!hasIndexForField(existingIndexes, "expiresAt")) {
                indexOps.ensureIndex(new Index().on("expiresAt", org.springframework.data.domain.Sort.Direction.ASC)
                        .expire(0, TimeUnit.SECONDS));
            }
        } catch (Exception e) {
            System.out.println("Some session indexes already exist: " + e.getMessage());
        }
    }

    private void createRequestIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_requests");
            // _id 인덱스는 MongoDB에서 자동으로 생성되므로 별도 생성 불필요
        } catch (Exception e) {
            System.out.println("Some request indexes already exist: " + e.getMessage());
        }
    }

    private void createCredentialIndexes() {
        try {
            IndexOperations indexOps = mongoTemplate.indexOps("col_credentials");
            List<IndexInfo> existingIndexes = indexOps.getIndexInfo();

            // clientId 유니크 인덱스
            if (!hasIndexForField(existingIndexes, "clientId")) {
                indexOps.ensureIndex(new Index().on("clientId", org.springframework.data.domain.Sort.Direction.ASC).unique());
            }
        } catch (Exception e) {
            System.out.println("Credential indexes already exist (this is normal): " + e.getMessage());
        }
    }

    /**
     * 특정 필드에 대한 인덱스가 이미 존재하는지 확인
     */
    private boolean hasIndexForField(List<IndexInfo> existingIndexes, String fieldName) {
        return existingIndexes.stream()
                .anyMatch(indexInfo ->
                        indexInfo.getIndexFields().stream()
                                .anyMatch(field -> field.getKey().equals(fieldName))
                );
    }
}