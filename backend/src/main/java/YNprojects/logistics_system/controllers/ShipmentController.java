package YNprojects.logistics_system.controllers;

import YNprojects.logistics_system.DTO.ChangeStatusShipmentDto;
import YNprojects.logistics_system.DTO.CreateShipmentDto;
import YNprojects.logistics_system.DTO.ShipmentDto;
import YNprojects.logistics_system.repositories.ShipmentRepo;
import YNprojects.logistics_system.services.ShipmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipment")
@AllArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<List<ShipmentDto>> getAllShipment() {
        return ResponseEntity.ok(shipmentService.getAllShipment());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDto> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<ShipmentDto> createShipment(@RequestBody CreateShipmentDto createShipmentDto) {
        return ResponseEntity.ok(shipmentService.createShipment(createShipmentDto));
    }

    @PostMapping("/change-status")
    public ResponseEntity<ShipmentDto> changeStatus(@RequestBody ChangeStatusShipmentDto changeStatusShipmentDto) {
        return ResponseEntity.ok(shipmentService.changeStatus(changeStatusShipmentDto));
    }

}
