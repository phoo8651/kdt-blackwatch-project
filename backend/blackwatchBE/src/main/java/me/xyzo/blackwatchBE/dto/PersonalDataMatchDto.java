package me.xyzo.blackwatchBE.dto;

import java.util.List;

public class PersonalDataMatchDto {
    private String email;
    private String name;
    private boolean found;
    private List<String> leakIds;

    public PersonalDataMatchDto(String email, String name, boolean found, List<String> leakIds) {
        this.email = email;
        this.name = name;
        this.found = found;
        this.leakIds = leakIds;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isFound() { return found; }
    public void setFound(boolean found) { this.found = found; }

    public List<String> getLeakIds() { return leakIds; }
    public void setLeakIds(List<String> leakIds) { this.leakIds = leakIds; }
}

