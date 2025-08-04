package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.AlertDto;
import YNprojects.logistics_system.entities.*;
import YNprojects.logistics_system.repositories.ProductAlertRepo;
import YNprojects.logistics_system.repositories.ShipmentAlertRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
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

    public List<AlertDto> getAllAlerts() {
        List<AlertDto> alerts = new ArrayList<>();
        List<ProductAlert> productAlerts = productAlertRepo.findAll();
        List<ShipmentAlert> shipmentAlerts = shipmentAlertRepo.findAll();
        productAlerts .forEach(pa -> alerts.add(new AlertDto(
                pa.getId(),
                pa.getType(),
                pa.getMessage(),
                pa.getCreatedAt(),
                pa.getProduct().getId(),
                null
        )));
        shipmentAlerts.forEach(sa -> alerts.add(new AlertDto(
                sa.getId(),
                sa.getType(),
                sa.getMessage(),
                sa.getCreatedAt(),
                null,
                sa.getShipment().getId()
        )));
        alerts.sort(Comparator.comparing(AlertDto::getCreatedAt).reversed());
        return alerts;
    }

}
