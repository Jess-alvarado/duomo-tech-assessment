package com.duomo.personmanagement.repository;

import com.duomo.personmanagement.model.Person;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class PersonRepository {

    private final Map<Long, Person> personStorage = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public Person save(Person person) {
        if (person.getId() == null) {
            person.setId(idGenerator.getAndIncrement());
        }
        personStorage.put(person.getId(), person);
        return person;
    }

    public List<Person> findAll() {
        return new ArrayList<>(personStorage.values());
    }

    public Optional<Person> findById(Long id) {
        return Optional.ofNullable(personStorage.get(id));
    }

    public boolean deleteById(Long id) {
        if (personStorage.containsKey(id)) {
            personStorage.remove(id);
            return true;
        }
        return false;
    }
}