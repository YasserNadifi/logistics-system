package YNprojects.logistics_system.shipment.controller;

import YNprojects.logistics_system.shipment.dto.ChangeShipmentStatusDto;
import YNprojects.logistics_system.shipment.dto.CreateShipmentDto;
import YNprojects.logistics_system.shipment.dto.ShipmentDto;
import YNprojects.logistics_system.shipment.service.ShipmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/shipments")
@AllArgsConstructor
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ShipmentDto> createShipment(@RequestBody CreateShipmentDto dto) {
        ShipmentDto saved = shipmentService.createShipment(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentDto>> listShipments() {
        List<ShipmentDto> list = shipmentService.getAllShipment();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDto> getShipment(@PathVariable Long id) {
        ShipmentDto dto = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/change-status")
    public ResponseEntity<ShipmentDto> changeStatus(ChangeShipmentStatusDto changeDto) {
        ShipmentDto updated = shipmentService.changeShipmentStatus(changeDto);
        return ResponseEntity.ok(updated);
    }

}
