package YNprojects.logistics_system;

import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.ShipmentStatus;
import YNprojects.logistics_system.repositories.ProductRepo;
import YNprojects.logistics_system.repositories.ShipmentRepo;
import YNprojects.logistics_system.scheduler.ShipmentStatusScheduler;
import YNprojects.logistics_system.services.ShipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.TestPropertySource;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
class ShipmentStatusSchedulerTest {

    @Autowired
    ShipmentRepo shipmentRepo;
    @Autowired
    ShipmentService shipmentService;
    @Autowired
    ShipmentStatusScheduler scheduler;

    @Autowired
    ProductRepo productRepo;

    @TestConfiguration
    static class FixedClockConfig {
        @Bean
        Clock fixedClock() {
            // pretend “today” is 2025-08-15
            Instant instant = LocalDate.of(2025, 8, 15)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant();
            return Clock.fixed(instant, ZoneId.systemDefault());
        }
    }


    @Test
    void transitAndDelay_areAppliedCorrectly() {
        // 1) Create a PLANNED shipment with departure=2025-08-14, ETA=2025-08-20
        Shipment s1 = new Shipment();
        s1.setProduct(productRepo.findById(4L).get());
        s1.setQuantity(10.0);
        s1.setStatus(ShipmentStatus.PLANNED);
        s1.setDepartureDate(LocalDate.of(2025,8,14));
        s1.setEstimateArrivalDate(LocalDate.of(2025,8,20));
        shipmentRepo.save(s1);

        // 2) Create an IN_TRANSIT shipment with ETA=2025-08-10 (already overdue)
        Shipment s2 = new Shipment(/* ... */);
        s2.setProduct(productRepo.findById(4L).get());
        s2.setQuantity(10.0);
        s2.setStatus(ShipmentStatus.IN_TRANSIT);
        s2.setDepartureDate(LocalDate.of(2025,8,10));
        s2.setEstimateArrivalDate(LocalDate.of(2025,8,10));
        shipmentRepo.save(s2);

        // 3) Fire the scheduler logic
        scheduler.transitPlannedShipments();
        scheduler.delayOverdueShipments();

        // 4) Reload and assert
        Shipment updated1 = shipmentRepo.findById(s1.getId()).get();
        Shipment updated2 = shipmentRepo.findById(s2.getId()).get();

        assertThat(updated1.getStatus())
                .isEqualTo(ShipmentStatus.IN_TRANSIT);
        assertThat(updated2.getStatus())
                .isEqualTo(ShipmentStatus.DELAYED);
    }
}