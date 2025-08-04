package YNprojects.logistics_system.services;

import YNprojects.logistics_system.entities.*;
import YNprojects.logistics_system.repositories.ProductAlertRepo;
import YNprojects.logistics_system.repositories.ShipmentAlertRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@AllArgsConstructor
@Service
public class AlertService {

    private final ProductAlertRepo productAlertRepo;
    private final ShipmentAlertRepo shipmentAlertRepo;

    public void createProductAlert(Product product, AlertType alertType) {
        if(productAlertRepo.existsByTypeAndProduct(alertType, product)) {return;}
        String message = "";
        if (alertType == AlertType.LOW_STOCK) {
            message = "Low Stock. Product : " + product.getName();
        }
        ProductAlert alert = new ProductAlert();
        alert.setType(alertType);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setProduct(product);
        productAlertRepo.save(alert);
    }

    public void createShipmentAlert(Shipment shipment, AlertType alertType) {
        if(shipmentAlertRepo.existsByTypeAndShipment(alertType, shipment)) {return;}
        String message = "";
        if (alertType == AlertType.SHIPMENT_DELAYED) {
            message = "Shipment delayed : " + shipment.getReferenceCode();
        }
        ShipmentAlert alert = new ShipmentAlert();
        alert.setType(alertType);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setShipment(shipment);
        shipmentAlertRepo.save(alert);
    }

}
