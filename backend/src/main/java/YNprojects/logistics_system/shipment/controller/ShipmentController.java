package YNprojects.logistics_system.shipment.controller;

import YNprojects.logistics_system.shipment.dto.ChangeShipmentStatusDto;
import YNprojects.logistics_system.shipment.dto.CreateShipmentDto;
import YNprojects.logistics_system.shipment.dto.ShipmentDto;
import YNprojects.logistics_system.shipment.service.ShipmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipments")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ShipmentDto> createShipment(@RequestBody CreateShipmentDto dto) {
        ShipmentDto saved = shipmentService.createShipment(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentDto>> listShipments() {
        List<ShipmentDto> list = shipmentService.getAllShipments();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/inbound")
    public ResponseEntity<List<ShipmentDto>> getInboundShipments() {
        List<ShipmentDto> list = shipmentService.getInboundShipments();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/outbound")
    public ResponseEntity<List<ShipmentDto>> getOutboundShipments() {
        List<ShipmentDto> list = shipmentService.getOutboundShipments();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDto> getShipment(@PathVariable Long id) {
        ShipmentDto dto = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/change-status")
    public ResponseEntity<ShipmentDto> changeStatus(@RequestBody ChangeShipmentStatusDto changeDto) {
        System.out.println(changeDto);
        ShipmentDto updated = shipmentService.changeShipmentStatus(changeDto);
        return ResponseEntity.ok(updated);
    }

}
