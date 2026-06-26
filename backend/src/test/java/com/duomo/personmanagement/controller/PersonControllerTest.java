package com.duomo.personmanagement.controller;

import com.duomo.personmanagement.dto.PersonRequest;
import com.duomo.personmanagement.dto.PersonResponse;
import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Region;
import com.duomo.personmanagement.service.PersonService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PersonController.class)
@DisplayName("PersonController")
class PersonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PersonService personService;

    private Region regionMetropolitana;
    private Commune comunaSantiago;

    @BeforeEach
    void setUp() {
        regionMetropolitana = new Region("RM", "Región Metropolitana");
        comunaSantiago = new Commune("stgo", "Santiago", "RM");
    }

    private PersonRequest buildValidRequest() {
        PersonRequest request = new PersonRequest();
        request.setFirstName("Juan");
        request.setLastName("Pérez");
        request.setEmail("juan.perez@email.com");
        request.setAge(25);
        request.setRegion(regionMetropolitana);
        request.setCommune(comunaSantiago);
        return request;
    }

    private PersonResponse buildResponse(Long id) {
        PersonResponse response = new PersonResponse();
        response.setId(id);
        response.setFirstName("Juan");
        response.setLastName("Pérez");
        response.setEmail("juan.perez@email.com");
        response.setAge(25);
        response.setRegion(regionMetropolitana);
        response.setCommune(comunaSantiago);
        return response;
    }

    @Nested
    @DisplayName("POST /api/persons")
    class CreatePerson {

        @Test
        @DisplayName("devuelve 201 con la persona creada cuando los datos son válidos")
        void returns201WhenDataIsValid() throws Exception {
            PersonRequest request = buildValidRequest();
            PersonResponse response = buildResponse(1L);

            when(personService.createPerson(any(PersonRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/persons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.firstName").value("Juan"))
                    .andExpect(jsonPath("$.region.id").value("RM"))
                    .andExpect(jsonPath("$.commune.id").value("stgo"));
        }

        @Test
        @DisplayName("devuelve 400 cuando faltan campos obligatorios")
        void returns400WhenRequiredFieldsAreMissing() throws Exception {
            PersonRequest request = new PersonRequest();

            mockMvc.perform(post("/api/persons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.validations.firstName").exists())
                    .andExpect(jsonPath("$.validations.email").exists());
        }

        @Test
        @DisplayName("devuelve 400 cuando el email tiene formato inválido")
        void returns400WhenEmailIsInvalid() throws Exception {
            PersonRequest request = buildValidRequest();
            request.setEmail("no-es-un-email");

            mockMvc.perform(post("/api/persons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validations.email").exists());
        }

        @Test
        @DisplayName("devuelve 400 cuando la edad es menor a 18")
        void returns400WhenAgeIsBelowMinimum() throws Exception {
            PersonRequest request = buildValidRequest();
            request.setAge(17);

            mockMvc.perform(post("/api/persons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validations.age").exists());
        }

        @Test
        @DisplayName("devuelve 400 cuando la comuna no corresponde a la región")
        void returns400WhenCommuneDoesNotMatchRegion() throws Exception {
            PersonRequest request = buildValidRequest();

            when(personService.createPerson(any(PersonRequest.class)))
                    .thenThrow(new IllegalArgumentException("La comuna no corresponde a la región seleccionada."));

            mockMvc.perform(post("/api/persons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("La comuna no corresponde a la región seleccionada."));
        }
    }

    @Nested
    @DisplayName("GET /api/persons")
    class GetAllPersons {

        @Test
        @DisplayName("devuelve 200 con la lista de personas")
        void returns200WithPersonList() throws Exception {
            when(personService.getAllPersons()).thenReturn(List.of(buildResponse(1L), buildResponse(2L)));

            mockMvc.perform(get("/api/persons"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @DisplayName("devuelve 200 con lista vacía cuando no hay personas")
        void returns200WithEmptyListWhenNoPersonsExist() throws Exception {
            when(personService.getAllPersons()).thenReturn(List.of());

            mockMvc.perform(get("/api/persons"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/persons/{id}")
    class GetPersonById {

        @Test
        @DisplayName("devuelve 200 con la persona cuando el id existe")
        void returns200WhenPersonExists() throws Exception {
            when(personService.getPersonById(1L)).thenReturn(Optional.of(buildResponse(1L)));

            mockMvc.perform(get("/api/persons/{id}", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        @DisplayName("devuelve 404 cuando el id no existe")
        void returns404WhenPersonDoesNotExist() throws Exception {
            when(personService.getPersonById(99L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/persons/{id}", 99L))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("devuelve 400 cuando el id no es numérico")
        void returns400WhenIdIsNotNumeric() throws Exception {
            mockMvc.perform(get("/api/persons/{id}", "abc"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));
        }
    }

    @Nested
    @DisplayName("DELETE /api/persons/{id}")
    class DeletePerson {

        @Test
        @DisplayName("devuelve 204 cuando la persona se elimina correctamente")
        void returns204WhenPersonIsDeleted() throws Exception {
            when(personService.deletePerson(1L)).thenReturn(true);

            mockMvc.perform(delete("/api/persons/{id}", 1L))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("devuelve 404 cuando el id no existe")
        void returns404WhenPersonDoesNotExist() throws Exception {
            when(personService.deletePerson(99L)).thenReturn(false);

            mockMvc.perform(delete("/api/persons/{id}", 99L))
                    .andExpect(status().isNotFound());
        }
    }
}