package com.duomo.personmanagement.service;

import com.duomo.personmanagement.model.Commune;
import com.duomo.personmanagement.model.Region;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CatalogService")
class CatalogServiceTest {

    private CatalogService catalogService;

    @BeforeEach
    void setUp() throws Exception {
        catalogService = new CatalogService();
        catalogService.run();
    }

    @Nested
    @DisplayName("getAllRegions")
    class GetAllRegions {

        @Test
        @DisplayName("devuelve todas las regiones cargadas en memoria")
        void returnsAllLoadedRegions() {
            List<Region> regions = catalogService.getAllRegions();

            assertThat(regions).hasSize(3);
            assertThat(regions)
                    .extracting(Region::getId)
                    .containsExactlyInAnyOrder("RM", "V", "VIII");
        }
    }

    @Nested
    @DisplayName("getCommunesByRegion")
    class GetCommunesByRegion {

        @Test
        @DisplayName("devuelve solo las comunas de la región pedida")
        void returnsOnlyCommunesForGivenRegion() {
            List<Commune> communes = catalogService.getCommunesByRegion("RM");

            assertThat(communes)
                    .extracting(Commune::getId)
                    .containsExactlyInAnyOrder("stgo", "prov", "maipu");
            assertThat(communes).allMatch(c -> c.getRegionId().equals("RM"));
        }

        @Test
        @DisplayName("devuelve lista vacía cuando la región no existe")
        void returnsEmptyListWhenRegionDoesNotExist() {
            List<Commune> communes = catalogService.getCommunesByRegion("XYZ");

            assertThat(communes).isEmpty();
        }

        @Test
        @DisplayName("filtra sin distinguir mayúsculas o minúsculas en el id de región")
        void filtersCaseInsensitively() {
            List<Commune> communes = catalogService.getCommunesByRegion("rm");

            assertThat(communes)
                    .extracting(Commune::getId)
                    .containsExactlyInAnyOrder("stgo", "prov", "maipu");
        }
    }
}