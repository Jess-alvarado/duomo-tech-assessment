package com.duomo.personmanagement.service;

import com.duomo.personmanagement.dto.PersonRequest;
import com.duomo.personmanagement.dto.PersonResponse;
import com.duomo.personmanagement.model.Person;
import com.duomo.personmanagement.repository.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PersonService {

    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<PersonResponse> getAllPersons() {
        return personRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Optional<PersonResponse> getPersonById(Long id) {
        return personRepository.findById(id)
                .map(this::convertToResponse);
    }

    public PersonResponse createPerson(PersonRequest request) {
        if (!request.getCommune().getRegionId().equals(request.getRegion().getId())) {
            throw new IllegalArgumentException("La comuna no corresponde a la región seleccionada.");
        }

        Person personEntity = convertToEntity(request);
        Person savedPerson = personRepository.save(personEntity);

        return convertToResponse(savedPerson);
    }

    public boolean deletePerson(Long id) {
        return personRepository.deleteById(id);
    }

    private Person convertToEntity(PersonRequest request) {
        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setEmail(request.getEmail());
        person.setAge(request.getAge());
        person.setRegion(request.getRegion());
        person.setCommune(request.getCommune());
        return person;
    }

    private PersonResponse convertToResponse(Person person) {
        PersonResponse response = new PersonResponse();
        response.setId(person.getId());
        response.setFirstName(person.getFirstName());
        response.setLastName(person.getLastName());
        response.setEmail(person.getEmail());
        response.setAge(person.getAge());
        response.setRegion(person.getRegion());
        response.setCommune(person.getCommune());
        return response;
    }
}