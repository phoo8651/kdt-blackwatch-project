package me.xyzo.blackwatchBE.dto;

import java.util.List;

public class PersonalDataSearchResultDto {
    private List<PersonalDataMatchDto> matches;
    private int totalFound;

    public PersonalDataSearchResultDto(List<PersonalDataMatchDto> matches, int totalFound) {
        this.matches = matches;
        this.totalFound = totalFound;
    }

    public List<PersonalDataMatchDto> getMatches() { return matches; }
    public void setMatches(List<PersonalDataMatchDto> matches) { this.matches = matches; }

    public int getTotalFound() { return totalFound; }
    public void setTotalFound(int totalFound) { this.totalFound = totalFound; }
}
