package YNprojects.logistics_system.shipment.entity;

import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.supplier.entity.Supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String referenceCode;       // PO-/SH- style ref
    private ShipmentDirection direction; // INBOUND, OUTBOUND
    private ShipmentStatus status;       // PLANNED, IN_TRANSIT, DELIVERED, CANCELLED, DELAYED
    private TransportMode transportMode;
    private double quantity;

    @ManyToOne(optional=true)
    private Product product;         // set for OUTBOUND

    @ManyToOne(optional=true)
    private RawMaterial rawMaterial; // set for INBOUND

    // link supplier (only for INBOUND)
    @ManyToOne(optional=true)
    private Supplier supplier;

    private String customerName;     // optional info for OUTBOUND

    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;
    private LocalDate actualArrivalDate;

    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}

