package me.xyzo.blackwatchBE.repository;

import me.xyzo.blackwatchBE.domain.ClientSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientSecretRepository extends JpaRepository<ClientSecret, String> {
}