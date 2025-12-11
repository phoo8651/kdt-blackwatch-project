package me.xyzo.blackwatchBE.service;

import me.xyzo.blackwatchBE.document.LeakedDataDocument;
import me.xyzo.blackwatchBE.document.VulnerabilityDataDocument;
import me.xyzo.blackwatchBE.dto.*;
import me.xyzo.blackwatchBE.exception.NotFoundException;
import me.xyzo.blackwatchBE.repository.LeakedDataRepository;
import me.xyzo.blackwatchBE.repository.VulnerabilityDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MongoDataService {

    @Autowired
    private LeakedDataRepository leakedDataRepository;

    @Autowired
    private VulnerabilityDataRepository vulnerabilityDataRepository;

    // ======= 유출 데이터 조회 메서드 =======

    public Page<Map<String, Object>> getLeakedData(
            LocalDateTime from, LocalDateTime to, List<String> hosts,
            String pathContains, String titleContains, String author,
            Integer recordMin, Integer recordMax, String iocContains,
            String q, String projection, Pageable pageable) {

        Page<LeakedDataDocument> documents;

        if (q != null && !q.trim().isEmpty()) {
            // 전체 텍스트 검색
            documents = leakedDataRepository.findByTextSearch(q, pageable);
        } else {
            // 필터 검색 - 타입 변경에 따른 수정
            String host = hosts != null && !hosts.isEmpty() ? hosts.get(0) : null;
            String fromStr = from != null ? from.toString() : null;
            String toStr = to != null ? to.toString() : null;
            String recordMinStr = recordMin != null ? recordMin.toString() : null;
            String recordMaxStr = recordMax != null ? recordMax.toString() : null;

            documents = leakedDataRepository.findWithFilters(
                    fromStr, toStr, host, pathContains, titleContains, author,
                    recordMinStr, recordMaxStr, iocContains, pageable);
        }

        // 개인정보 제거하고 Map으로 변환
        return documents.map(this::sanitizeLeakedData);
    }

    public LeakedDataDocument getLeakedDataDetail(String id) {
        LeakedDataDocument document = leakedDataRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("데이터를 찾을 수 없습니다."));

        // 개인정보 제거
        return sanitizeLeakedDataDocument(document);
    }

    public PersonalDataSearchResultDto findPersonalData(PersonalDataSearchDto request) {
        if ((request.getEmails() == null || request.getEmails().isEmpty()) &&
                (request.getNames() == null || request.getNames().isEmpty())) {
            return new PersonalDataSearchResultDto(new ArrayList<>(), 0);
        }

        List<PersonalDataMatchDto> matches = new ArrayList<>();
        int totalFound = 0;

        if (request.getEmails() != null && !request.getEmails().isEmpty()) {
            List<LeakedDataDocument> emailMatches =
                    leakedDataRepository.findByLeakedEmailIn(request.getEmails());

            for (String email : request.getEmails()) {
                List<String> leakIds = emailMatches.stream()
                        .filter(doc -> {
                            List<String> emails = doc.getLeakedEmail();
                            return emails != null && emails.contains(email);
                        })
                        .map(LeakedDataDocument::getId)
                        .collect(Collectors.toList());

                boolean found = !leakIds.isEmpty();
                if (found) totalFound++;
                matches.add(new PersonalDataMatchDto(email, null, found, leakIds));
            }
        }

        if (request.getNames() != null && !request.getNames().isEmpty()) {
            List<LeakedDataDocument> nameMatches =
                    leakedDataRepository.findByLeakedNameIn(request.getNames());

            for (String name : request.getNames()) {
                List<String> leakIds = nameMatches.stream()
                        .filter(doc -> {
                            List<String> names = doc.getLeakedName();
                            return names != null && names.contains(name);
                        })
                        .map(LeakedDataDocument::getId)
                        .collect(Collectors.toList());

                boolean found = !leakIds.isEmpty();
                if (found) totalFound++;
                matches.add(new PersonalDataMatchDto(null, name, found, leakIds));
            }
        }

        return new PersonalDataSearchResultDto(matches, totalFound);
    }

    // ======= 취약점 데이터 조회 메서드 =======

    public Page<Map<String, Object>> getVulnerabilityData(
            LocalDateTime from, LocalDateTime to, List<String> hosts,
            String pathContains, String titleContains, String author,
            List<String> cves, Double cvssMin, Double cvssMax,
            String vulnClass, String q, String projection, Pageable pageable) {

        Page<VulnerabilityDataDocument> documents;

        if (q != null && !q.trim().isEmpty()) {
            // 전체 텍스트 검색
            documents = vulnerabilityDataRepository.findByTextSearch(q, pageable);
        } else {
            // 필터 검색 - CVSS String 타입으로 처리
            String host = hosts != null && !hosts.isEmpty() ? hosts.get(0) : null;
            String fromStr = from != null ? from.toString() : null;
            String toStr = to != null ? to.toString() : null;
            String cvesStr = cves != null && !cves.isEmpty() ? String.join(",", cves) : null;
            String cvssMinStr = cvssMin != null ? cvssMin.toString() : null;
            String cvssMaxStr = cvssMax != null ? cvssMax.toString() : null;

            documents = vulnerabilityDataRepository.findWithFilters(
                    fromStr, toStr, host, pathContains, titleContains, author,
                    cvesStr, cvssMinStr, cvssMaxStr, vulnClass, pageable);
        }

        return documents.map(this::convertVulnerabilityToMap);
    }

    public VulnerabilityDataDocument getVulnerabilityDataDetail(String id) {
        return vulnerabilityDataRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("데이터를 찾을 수 없습니다."));
    }

    // ======= 헬퍼 메서드 =======

    private Map<String, Object> sanitizeLeakedData(LeakedDataDocument data) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", data.getId());
        result.put("clientId", data.getClientId());
        result.put("host", data.getHost());
        result.put("path", data.getPath());
        result.put("title", data.getTitle());
        result.put("author", data.getAuthor());
        result.put("uploadDate", data.getUploadDate());
        result.put("leakType", data.getLeakType());
        result.put("recordsCount", data.getRecordsCount());
        result.put("iocs", data.getIocs());
        result.put("price", data.getPrice());

        // 개인정보 제거
        String sanitizedArticle = data.getArticle();
        if (sanitizedArticle != null) {
            sanitizedArticle = sanitizedArticle.replaceAll("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "[이메일]");
            sanitizedArticle = sanitizedArticle.replaceAll("[가-힣]{3,}", "[이름]");
        }
        result.put("article", sanitizedArticle);
        result.put("ref", data.getRef());

        // leaked 객체에서 개인정보 제거된 버전 생성
        if (data.getLeaked() != null) {
            Map<String, Object> sanitizedLeaked = new HashMap<>(data.getLeaked());
            sanitizedLeaked.remove("email");
            sanitizedLeaked.remove("realname");
            sanitizedLeaked.remove("username");
            // 해시, 파일명, 카운트는 유지
            result.put("leaked", sanitizedLeaked);
        }

        return result;
    }

    private LeakedDataDocument sanitizeLeakedDataDocument(LeakedDataDocument data) {
        // 개인정보 필드 제거
        data.setLeakedEmail(null);
        data.setLeakedName(null);
        data.setLeakedUsername(null);

        // leaked 객체에서도 개인정보 제거
        if (data.getLeaked() != null) {
            Map<String, Object> sanitizedLeaked = new HashMap<>(data.getLeaked());
            sanitizedLeaked.remove("email");
            sanitizedLeaked.remove("realname");
            sanitizedLeaked.remove("username");
            data.setLeaked(sanitizedLeaked);
        }

        // article에서 개인정보 마스킹
        if (data.getArticle() != null) {
            String sanitized = data.getArticle()
                    .replaceAll("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "[이메일]")
                    .replaceAll("[가-힣]{3,}", "[이름]");
            data.setArticle(sanitized);
        }

        return data;
    }

    private Map<String, Object> convertVulnerabilityToMap(VulnerabilityDataDocument data) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", data.getId());
        result.put("clientId", data.getClientId());
        result.put("host", data.getHost());
        result.put("path", data.getPath());
        result.put("title", data.getTitle());
        result.put("author", data.getAuthor());
        result.put("uploadDate", data.getUploadDate());
        result.put("cveIds", data.getCveIds()); // PDF 명세에 맞게 cveIds 사용
        result.put("cvss", data.getCvss());
        result.put("vulnerabilityClass", data.getVulnerabilityClass());
        result.put("products", data.getProducts());
        result.put("exploitationTechnique", data.getExploitationTechnique());
        result.put("article", data.getArticle());
        result.put("ref", data.getRef());

        return result;
    }
}