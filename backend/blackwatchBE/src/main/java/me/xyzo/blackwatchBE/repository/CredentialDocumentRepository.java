package me.xyzo.blackwatchBE.repository;

import me.xyzo.blackwatchBE.document.CredentialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CredentialDocumentRepository extends MongoRepository<CredentialDocument, String> {
    Optional<CredentialDocument> findByClientId(String clientId);
    void deleteByClientId(String clientId);
}