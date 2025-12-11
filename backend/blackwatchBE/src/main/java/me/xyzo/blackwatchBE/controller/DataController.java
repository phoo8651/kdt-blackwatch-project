package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.xyzo.blackwatchBE.document.LeakedDataDocument;
import me.xyzo.blackwatchBE.document.VulnerabilityDataDocument;
import me.xyzo.blackwatchBE.dto.PersonalDataSearchDto;
import me.xyzo.blackwatchBE.dto.PersonalDataSearchResultDto;
import me.xyzo.blackwatchBE.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data")
@Tag(name = "Data", description = "MongoDB direct connection based data query API")
public class DataController {

    @Autowired
    private DataService dataService;

    @GetMapping("/leaked")
    @Operation(summary = "Get leaked data", description = "Search leaked data directly from MongoDB")
    public ResponseEntity<Page<Map<String, Object>>> getLeakedData(
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(defaultValue = "-uploadDate") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int limit,
            @RequestParam(required = false) String host,
            @RequestParam(required = false) String pathContains,
            @RequestParam(required = false) String titleContains,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Integer recordMin,
            @RequestParam(required = false) Integer recordMax,
            @RequestParam(required = false) String iocContains,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String projection) {

        Sort sortObj = sort.startsWith("-")
                ? Sort.by(Sort.Direction.DESC, sort.substring(1))
                : Sort.by(Sort.Direction.ASC, sort);

        if (limit > 1000) limit = 1000;
        Pageable pageable = PageRequest.of(page, limit, sortObj);

        List<String> hosts = host != null ? Arrays.asList(host.split(",")) : null;

        Page<Map<String, Object>> result = dataService.getLeakedData(
                from, to, hosts, pathContains, titleContains, author,
                recordMin, recordMax, iocContains, q, projection, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/leaked/{id}")
    @Operation(summary = "Get leaked data details", description = "Get detailed data directly from MongoDB")
    public ResponseEntity<LeakedDataDocument> getLeakedDataDetail(@PathVariable String id) {
        LeakedDataDocument result = dataService.getLeakedDataDetail(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/leaked/find")
    @Operation(summary = "Check personal data leak", description = "Search for personal data leak existence directly from MongoDB")
    public ResponseEntity<PersonalDataSearchResultDto> findPersonalData(@RequestBody PersonalDataSearchDto request) {
        PersonalDataSearchResultDto result = dataService.findPersonalData(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vulnerability")
    @Operation(summary = "Get vulnerability data", description = "Search vulnerability data directly from MongoDB")
    public ResponseEntity<Page<Map<String, Object>>> getVulnerabilityData(
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(defaultValue = "-uploadDate") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int limit,
            @RequestParam(required = false) String host,
            @RequestParam(required = false) String pathContains,
            @RequestParam(required = false) String titleContains,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String cve,
            @RequestParam(required = false) Double cvssMin,
            @RequestParam(required = false) Double cvssMax,
            @RequestParam(required = false) String vulnClass,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String projection) {

        Sort sortObj = sort.startsWith("-")
                ? Sort.by(Sort.Direction.DESC, sort.substring(1))
                : Sort.by(Sort.Direction.ASC, sort);

        if (limit > 1000) limit = 1000;
        Pageable pageable = PageRequest.of(page, limit, sortObj);

        List<String> hosts = host != null ? Arrays.asList(host.split(",")) : null;
        List<String> cves = cve != null ? Arrays.asList(cve.split(",")) : null;

        Page<Map<String, Object>> result = dataService.getVulnerabilityData(
                from, to, hosts, pathContains, titleContains, author,
                cves, cvssMin, cvssMax, vulnClass, q, projection, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/vulnerability/{id}")
    @Operation(summary = "Get vulnerability data details", description = "Get detailed data directly from MongoDB")
    public ResponseEntity<VulnerabilityDataDocument> getVulnerabilityDataDetail(@PathVariable String id) {
        VulnerabilityDataDocument result = dataService.getVulnerabilityDataDetail(id);
        return ResponseEntity.ok(result);
    }
}