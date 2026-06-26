package com.duomo.personmanagement.dto;

import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Region;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer age;
    private Region region;
    private Commune commune;
}