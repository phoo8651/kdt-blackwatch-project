package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "col_requests")
public class RequestDocument {
    @Id
    private String id;

    // 필요한 필드들 추가

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}