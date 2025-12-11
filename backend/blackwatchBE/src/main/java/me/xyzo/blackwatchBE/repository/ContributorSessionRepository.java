package me.xyzo.blackwatchBE.repository;

import me.xyzo.blackwatchBE.document.ContributorSessionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContributorSessionRepository extends MongoRepository<ContributorSessionDocument, String> {

    @Query("{ 'clientId': ?0, 'isActive': true, 'expiresAt': { $gt: ?1 } }")
    List<ContributorSessionDocument> findActiveSessionsByClientId(String clientId, LocalDateTime now);

    @Query("{ 'userId': ?0, 'isActive': true, 'expiresAt': { $gt: ?1 } }")
    List<ContributorSessionDocument> findActiveSessionsByUserId(String userId, LocalDateTime now);

    @Query("{ 'sessionId': ?0, 'isActive': true, 'expiresAt': { $gt: ?1 } }")
    Optional<ContributorSessionDocument> findActiveSessionById(String sessionId, LocalDateTime now);

    @Query("{ 'expiresAt': { $lt: ?0 } }")
    List<ContributorSessionDocument> findExpiredSessions(LocalDateTime now);

    void deleteByClientId(String clientId);
    void deleteByUserId(String userId);
}