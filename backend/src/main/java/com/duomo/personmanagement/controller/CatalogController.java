package com.duomo.personmanagement.controller;

import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Region;
import com.duomo.personmanagement.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "http://localhost:4200")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/regions")
    public ResponseEntity<List<Region>> getRegions() {
        return ResponseEntity.ok(catalogService.getAllRegions());
    }

    // GET: /api/catalogs/regions/{regionId}/communes
    // /api/catalogs/regions/RM/communes -> devolveria solo Santiago, Providencia y
    // Maipú (como ejemplos)
    @GetMapping("/regions/{regionId}/communes")
    public ResponseEntity<List<Commune>> getCommunesByRegion(@PathVariable String regionId) {
        List<Commune> communes = catalogService.getCommunesByRegion(regionId);
        return ResponseEntity.ok(communes);
    }
}