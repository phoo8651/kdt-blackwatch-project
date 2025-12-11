package me.xyzo.blackwatchBE.dto;

public class ContributionApplicationDto {
    private String userId;
    private String contact;
    private String handle;
    private String jobs;
    private String motivation;
    private boolean law;
    private boolean license;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getJobs() { return jobs; }
    public void setJobs(String jobs) { this.jobs = jobs; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public boolean isLaw() { return law; }
    public void setLaw(boolean law) { this.law = law; }

    public boolean isLicense() { return license; }
    public void setLicense(boolean license) { this.license = license; }
}
