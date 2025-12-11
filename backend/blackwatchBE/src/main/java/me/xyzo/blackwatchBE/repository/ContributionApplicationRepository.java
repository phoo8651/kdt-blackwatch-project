package me.xyzo.blackwatchBE.repository;

import me.xyzo.blackwatchBE.domain.ContributionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContributionApplicationRepository extends JpaRepository<ContributionApplication, String> {
    List<ContributionApplication> findByStatus(ContributionApplication.Status status);
}