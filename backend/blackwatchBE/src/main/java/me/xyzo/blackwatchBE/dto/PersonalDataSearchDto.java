package me.xyzo.blackwatchBE.dto;

import java.util.List;

public class PersonalDataSearchDto {
    private List<String> emails;
    private List<String> names;

    public List<String> getEmails() { return emails; }
    public void setEmails(List<String> emails) { this.emails = emails; }

    public List<String> getNames() { return names; }
    public void setNames(List<String> names) { this.names = names; }
}
