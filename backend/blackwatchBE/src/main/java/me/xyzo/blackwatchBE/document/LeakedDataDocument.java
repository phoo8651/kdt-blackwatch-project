package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "col_leaked")
public class LeakedDataDocument {

    @Id
    private String id;

    @Field("clientId")
    private String clientId;

    private String host;
    private String path;
    private String title;
    private String author;

    @Field("uploadDate")
    private String uploadDate;  // DB diagram에서 string으로 보임

    @Field("leakType")
    private String leakType;

    @Field("recordsCount")
    private String recordsCount;  // DB diagram에서 string으로 보임

    private List<String> iocs;  // array로 변경
    private String price;
    private String article;
    private List<String> ref;

    // leaked 필드는 중첩 객체로 변경
    private Map<String, Object> leaked;  // 이메일, 실명, 사용자명, 파일명, 해시 등이 포함된 객체

    // constructors
    public LeakedDataDocument() {}

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getUploadDate() { return uploadDate; }
    public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }

    public String getLeakType() { return leakType; }
    public void setLeakType(String leakType) { this.leakType = leakType; }

    public String getRecordsCount() { return recordsCount; }
    public void setRecordsCount(String recordsCount) { this.recordsCount = recordsCount; }

    public List<String> getIocs() { return iocs; }
    public void setIocs(List<String> iocs) { this.iocs = iocs; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getArticle() { return article; }
    public void setArticle(String article) { this.article = article; }

    public List<String> getRef() { return ref; }
    public void setRef(List<String> ref) { this.ref = ref; }

    public Map<String, Object> getLeaked() { return leaked; }
    public void setLeaked(Map<String, Object> leaked) { this.leaked = leaked; }

    // 호환성을 위한 legacy 메서드들
    @SuppressWarnings("unchecked")
    public List<String> getLeakedEmail() {
        if (leaked != null && leaked.containsKey("email")) {
            Object emailObj = leaked.get("email");
            if (emailObj instanceof List) {
                return (List<String>) emailObj;
            }
        }
        return null;
    }

    public void setLeakedEmail(List<String> leakedEmail) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("email", leakedEmail);
    }

    @SuppressWarnings("unchecked")
    public List<String> getLeakedName() {
        if (leaked != null && leaked.containsKey("realname")) {
            Object nameObj = leaked.get("realname");
            if (nameObj instanceof List) {
                return (List<String>) nameObj;
            }
        }
        return null;
    }

    public void setLeakedName(List<String> leakedName) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("realname", leakedName);
    }

    // 추가 leaked 필드들에 대한 접근자
    @SuppressWarnings("unchecked")
    public List<String> getLeakedUsername() {
        if (leaked != null && leaked.containsKey("username")) {
            Object usernameObj = leaked.get("username");
            if (usernameObj instanceof List) {
                return (List<String>) usernameObj;
            }
        }
        return null;
    }

    public void setLeakedUsername(List<String> leakedUsername) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("username", leakedUsername);
    }

    public String getLeakedFileName() {
        if (leaked != null && leaked.containsKey("fileName")) {
            return (String) leaked.get("fileName");
        }
        return null;
    }

    public void setLeakedFileName(String fileName) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("fileName", fileName);
    }

    public String getLeakedHash() {
        if (leaked != null && leaked.containsKey("hash")) {
            return (String) leaked.get("hash");
        }
        return null;
    }

    public void setLeakedHash(String hash) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("hash", hash);
    }

    public Integer getLeakedCount() {
        if (leaked != null && leaked.containsKey("count")) {
            return (Integer) leaked.get("count");
        }
        return null;
    }

    public void setLeakedCount(Integer count) {
        if (leaked == null) leaked = new java.util.HashMap<>();
        leaked.put("count", count);
    }
}