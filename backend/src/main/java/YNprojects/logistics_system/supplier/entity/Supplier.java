package YNprojects.logistics_system.supplier.entity;

import YNprojects.logistics_system.shipment.entity.Shipment;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String supplierName;

    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;

    @OneToMany
    private List<Shipment> shipments;
}
