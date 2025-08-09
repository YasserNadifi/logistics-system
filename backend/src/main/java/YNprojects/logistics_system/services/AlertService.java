package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.AlertDto;
import YNprojects.logistics_system.entities.*;
import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.repositories.InventoryAlertRepo;
import YNprojects.logistics_system.repositories.ProductAlertRepo;
import YNprojects.logistics_system.repositories.ShipmentAlertRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@AllArgsConstructor
@Service
public class AlertService {

    private final ProductAlertRepo productAlertRepo;
    private final ShipmentAlertRepo shipmentAlertRepo;
    private final InventoryAlertRepo inventoryAlertRepo;

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

    public void createInventoryAlert(Inventory inventory, AlertType alertType) {
        if(inventoryAlertRepo.existsByTypeAndInventory(alertType, inventory)) {return;}
        String message = "";
        if (alertType == AlertType.LOW_STOCK) {
            message = "Low Stock. Inventory: " + inventory.getId();
        }
        InventoryAlert alert = new InventoryAlert();
        alert.setType(alertType);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setInventory(inventory);
        inventoryAlertRepo.save(alert);
    }

    public List<AlertDto> getAllAlerts() {
        List<AlertDto> alerts = new ArrayList<>();
        List<ProductAlert> productAlerts = productAlertRepo.findAll();
        List<ShipmentAlert> shipmentAlerts = shipmentAlertRepo.findAll();
        List<InventoryAlert> inventoryAlerts = inventoryAlertRepo.findAll();
        productAlerts .forEach(pa -> alerts.add(new AlertDto(
                pa.getId(),
                pa.getType(),
                pa.getMessage(),
                pa.getCreatedAt(),
                pa.getProduct().getId(),
                null,
                null
        )));
        shipmentAlerts.forEach(sa -> alerts.add(new AlertDto(
                sa.getId(),
                sa.getType(),
                sa.getMessage(),
                sa.getCreatedAt(),
                null,
                sa.getShipment().getId(),
                null
        )));
        inventoryAlerts.forEach(ia -> alerts.add(new AlertDto(
                ia.getId(),
                ia.getType(),
                ia.getMessage(),
                ia.getCreatedAt(),
                null,
                null,
                ia.getInventory().getId()
        )));
        alerts.sort(Comparator.comparing(AlertDto::getCreatedAt).reversed());
        return alerts;
    }

}
