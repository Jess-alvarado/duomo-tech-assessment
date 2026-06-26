package com.duomo.personmanagement.service;

import com.duomo.personmanagement.dto.PersonRequest;
import com.duomo.personmanagement.dto.PersonResponse;
import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Person;
import com.duomo.personmanagement.model.Region;
import com.duomo.personmanagement.repository.PersonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PersonService")
class PersonServiceTest {

    @Mock
    private PersonRepository personRepository;

    private PersonService personService;

    private Region regionMetropolitana;
    private Commune comunaSantiago;
    private Commune comunaValparaiso;

    @BeforeEach
    void setUp() {
        personService = new PersonService(personRepository);

        regionMetropolitana = new Region("RM", "Región Metropolitana");
        comunaSantiago = new Commune("stgo", "Santiago", "RM");
        comunaValparaiso = new Commune("valpo", "Valparaíso", "V");
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

    @Nested
    @DisplayName("createPerson")
    class CreatePerson {

        @Test
        @DisplayName("crea la persona cuando la comuna pertenece a la región indicada")
        void createsPersonWhenCommuneBelongsToRegion() {
            PersonRequest request = buildValidRequest();

            Person savedEntity = new Person();
            savedEntity.setId(1L);
            savedEntity.setFirstName(request.getFirstName());
            savedEntity.setLastName(request.getLastName());
            savedEntity.setEmail(request.getEmail());
            savedEntity.setAge(request.getAge());
            savedEntity.setRegion(request.getRegion());
            savedEntity.setCommune(request.getCommune());

            when(personRepository.save(any(Person.class))).thenReturn(savedEntity);

            PersonResponse response = personService.createPerson(request);

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getFirstName()).isEqualTo("Juan");
            assertThat(response.getLastName()).isEqualTo("Pérez");
            assertThat(response.getEmail()).isEqualTo("juan.perez@email.com");
            assertThat(response.getAge()).isEqualTo(25);
            assertThat(response.getRegion()).isEqualTo(regionMetropolitana);
            assertThat(response.getCommune()).isEqualTo(comunaSantiago);
        }

        @Test
        @DisplayName("delega la persistencia en el repositorio con los datos correctos")
        void delegatesToRepositoryWithMappedEntity() {
            PersonRequest request = buildValidRequest();

            Person savedEntity = new Person();
            savedEntity.setId(1L);
            when(personRepository.save(any(Person.class))).thenReturn(savedEntity);

            personService.createPerson(request);

            ArgumentCaptor<Person> personCaptor = ArgumentCaptor.forClass(Person.class);
            verify(personRepository).save(personCaptor.capture());

            Person captured = personCaptor.getValue();
            assertThat(captured.getFirstName()).isEqualTo(request.getFirstName());
            assertThat(captured.getLastName()).isEqualTo(request.getLastName());
            assertThat(captured.getEmail()).isEqualTo(request.getEmail());
            assertThat(captured.getAge()).isEqualTo(request.getAge());
            assertThat(captured.getRegion()).isEqualTo(request.getRegion());
            assertThat(captured.getCommune()).isEqualTo(request.getCommune());
        }

        @Test
        @DisplayName("lanza IllegalArgumentException cuando la comuna no pertenece a la región")
        void throwsWhenCommuneDoesNotBelongToRegion() {
            PersonRequest request = buildValidRequest();
            request.setCommune(comunaValparaiso);

            assertThatThrownBy(() -> personService.createPerson(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La comuna no corresponde a la región seleccionada.");

            verify(personRepository, never()).save(any(Person.class));
        }
    }

    @Nested
    @DisplayName("getAllPersons")
    class GetAllPersons {

        @Test
        @DisplayName("devuelve una lista vacía cuando no hay personas registradas")
        void returnsEmptyListWhenNoPersonsExist() {
            when(personRepository.findAll()).thenReturn(List.of());

            List<PersonResponse> result = personService.getAllPersons();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("devuelve la lista de personas mapeadas correctamente")
        void returnsMappedPersonList() {
            Person person1 = new Person(1L, "Juan", "Pérez", "juan@email.com", 25, regionMetropolitana, comunaSantiago);
            Person person2 = new Person(2L, "Ana", "Soto", "ana@email.com", 30, regionMetropolitana, comunaSantiago);

            when(personRepository.findAll()).thenReturn(List.of(person1, person2));

            List<PersonResponse> result = personService.getAllPersons();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getFirstName()).isEqualTo("Juan");
            assertThat(result.get(1).getId()).isEqualTo(2L);
            assertThat(result.get(1).getFirstName()).isEqualTo("Ana");
        }
    }

    @Nested
    @DisplayName("getPersonById")
    class GetPersonById {

        @Test
        @DisplayName("devuelve la persona cuando el id existe")
        void returnsPersonWhenIdExists() {
            Person person = new Person(1L, "Juan", "Pérez", "juan@email.com", 25, regionMetropolitana, comunaSantiago);
            when(personRepository.findById(1L)).thenReturn(Optional.of(person));

            Optional<PersonResponse> result = personService.getPersonById(1L);

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(1L);
            assertThat(result.get().getFirstName()).isEqualTo("Juan");
        }

        @Test
        @DisplayName("devuelve Optional vacío cuando el id no existe")
        void returnsEmptyOptionalWhenIdDoesNotExist() {
            when(personRepository.findById(99L)).thenReturn(Optional.empty());

            Optional<PersonResponse> result = personService.getPersonById(99L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("deletePerson")
    class DeletePerson {

        @Test
        @DisplayName("devuelve true cuando la persona existe y se elimina")
        void returnsTrueWhenPersonIsDeleted() {
            when(personRepository.deleteById(1L)).thenReturn(true);

            boolean result = personService.deletePerson(1L);

            assertThat(result).isTrue();
            verify(personRepository).deleteById(eq(1L));
        }

        @Test
        @DisplayName("devuelve false cuando el id no existe")
        void returnsFalseWhenPersonDoesNotExist() {
            when(personRepository.deleteById(99L)).thenReturn(false);

            boolean result = personService.deletePerson(99L);

            assertThat(result).isFalse();
        }
    }
}