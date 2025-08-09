package YNprojects.logistics_system.productionorder.controller;

import YNprojects.logistics_system.productionorder.dto.ProductionOrderDto;
import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderStatus;
import YNprojects.logistics_system.productionorder.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-orders")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    public ResponseEntity<ProductionOrder> createOrder(@RequestBody ProductionOrderDto dto) {
        ProductionOrder created = productionOrderService.createProductionOrder(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ProductionOrderDto>> getAllOrders() {
        return ResponseEntity.ok(productionOrderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(productionOrderService.findById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProductionOrder> changeOrderStatus(
            @PathVariable Long id,
            @RequestParam ProductionOrderStatus status
    ) {
        ProductionOrder updated = productionOrderService.changeStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reverse")
    public ResponseEntity<ProductionOrder> reverseOrder(@PathVariable Long id) {
        ProductionOrder reversed = productionOrderService.reverseCompletedOrder(id);
        return ResponseEntity.ok(reversed);
    }
}
