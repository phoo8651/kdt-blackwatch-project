package me.xyzo.blackwatchBE.service;

import me.xyzo.blackwatchBE.document.LeakedDataDocument;
import me.xyzo.blackwatchBE.document.VulnerabilityDataDocument;
import me.xyzo.blackwatchBE.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DataService {

    @Autowired
    private MongoDataService mongoDataService;

    public Page<Map<String, Object>> getLeakedData(LocalDateTime from, LocalDateTime to, List<String> hosts,
                                                   String pathContains, String titleContains, String author,
                                                   Integer recordMin, Integer recordMax, String iocContains,
                                                   String q, String projection, Pageable pageable) {

        return mongoDataService.getLeakedData(from, to, hosts, pathContains, titleContains,
                author, recordMin, recordMax, iocContains, q, projection, pageable);
    }

    public LeakedDataDocument getLeakedDataDetail(String id) {
        return mongoDataService.getLeakedDataDetail(id);
    }

    public PersonalDataSearchResultDto findPersonalData(PersonalDataSearchDto request) {
        return mongoDataService.findPersonalData(request);
    }

    public Page<Map<String, Object>> getVulnerabilityData(LocalDateTime from, LocalDateTime to, List<String> hosts,
                                                          String pathContains, String titleContains, String author,
                                                          List<String> cves, Double cvssMin, Double cvssMax,
                                                          String vulnClass, String q, String projection, Pageable pageable) {

        return mongoDataService.getVulnerabilityData(from, to, hosts, pathContains, titleContains,
                author, cves, cvssMin, cvssMax, vulnClass, q, projection, pageable);
    }

    public VulnerabilityDataDocument getVulnerabilityDataDetail(String id) {
        return mongoDataService.getVulnerabilityDataDetail(id);
    }
}
