package com.duomo.personmanagement.service;

import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Region;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CatalogService implements CommandLineRunner {

    private final List<Region> regions = new ArrayList<>();
    private final List<Commune> communes = new ArrayList<>();

    @Override
    public void run(String... args) throws Exception {
        loadMockData();
    }

    private void loadMockData() {
        // algunas Regiones de ejemplo
        regions.add(new Region("RM", "Región Metropolitana"));
        regions.add(new Region("V", "Región de Valparaíso"));
        regions.add(new Region("VIII", "Región del Bío-Bío"));

        // Comunas de la RM
        communes.add(new Commune("stgo", "Santiago", "RM"));
        communes.add(new Commune("prov", "Providencia", "RM"));
        communes.add(new Commune("maipu", "Maipú", "RM"));

        // Comunas de valparaíso
        communes.add(new Commune("vina", "Viña del Mar", "V"));
        communes.add(new Commune("valpo", "Valparaíso", "V"));

        // Comunas de Bío-Bío
        communes.add(new Commune("conce", "Concepción", "VIII"));
        communes.add(new Commune("talca", "Talcahuano", "VIII"));
    }

    public List<Region> getAllRegions() {
        return regions;
    }

    public List<Commune> getCommunesByRegion(String regionId) {
        return communes.stream()
                .filter(commune -> commune.getRegionId().equalsIgnoreCase(regionId))
                .collect(Collectors.toList());
    }
}