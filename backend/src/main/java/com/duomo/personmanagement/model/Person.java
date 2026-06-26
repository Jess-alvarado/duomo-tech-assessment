package com.duomo.personmanagement.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Person {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ingresar un formato de email válido")
    private String email;

    @NotNull(message = "La edad es obligatoria")
    @Min(value = 18, message = "La persona debe ser mayor o igual a 18 años")
    private Integer age;

    @NotNull(message = "La región es obligatoria")
    private Region region;

    @NotNull(message = "La comuna es obligatoria")
    private Commune commune;
}