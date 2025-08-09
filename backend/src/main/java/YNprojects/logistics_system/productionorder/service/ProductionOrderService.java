package YNprojects.logistics_system.productionorder.service;

import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.product.repository.ProductRepo;
import YNprojects.logistics_system.productinventory.entities.ProductInventory;
import YNprojects.logistics_system.productinventory.repository.ProductInventoryRepo;
import YNprojects.logistics_system.productionorder.dto.ProductionOrderDto;
import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderMaterial;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderStatus;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderProduct;
import YNprojects.logistics_system.productionorder.mapper.ProductionOrderMapper;
import YNprojects.logistics_system.productionorder.repository.ProductionOrderRepo;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.rawmaterial.repository.RawMaterialRepo;
import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;
import YNprojects.logistics_system.rawmaterialinventory.repository.RawMaterialInventoryRepo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderRepo productionOrderRepo;
    private final RawMaterialInventoryRepo rawMaterialInventoryRepo;
    private final ProductInventoryRepo productInventoryRepo;
    private final ProductRepo productRepo;
    private final RawMaterialRepo rawMaterialRepo;


    @Transactional
    public ProductionOrder createProductionOrder(ProductionOrderDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("ProductionOrderDto cannot be null");
        }
        if (dto.getRawMaterials() == null || dto.getRawMaterials().isEmpty()) {
            throw new IllegalArgumentException("Order must include at least one rawMaterial ");
        }
        if (dto.getProduct() == null || dto.getProduct().getProductId() == null) {
            throw new IllegalArgumentException("Order must include a produced product with productId");
        }

        // Map DTO -> entity (shallow mapping; items currently contain placeholder RawMaterial/Product with only IDs)
        ProductionOrder order = ProductionOrderMapper.toEntity(dto);

        // Resolve and set full RawMaterial entities for each ProductionOrderMaterial
        if (order.getRawMaterials() != null) {
            for (ProductionOrderMaterial item : order.getRawMaterials()) {
                if (item.getRawMaterial() == null || item.getRawMaterial().getId() == null) {
                    throw new IllegalArgumentException("Each production order material must include rawMaterialId");
                }
                Long rawId = item.getRawMaterial().getId();
                RawMaterial rm = rawMaterialRepo.findById(rawId)
                        .orElseThrow(() -> new RuntimeException("RawMaterial not found with id: " + rawId));
                item.setRawMaterial(rm);

                // ensure back-reference is set (mapper should already do this but make sure)
                item.setProductionOrder(order);
            }
        }

        // Resolve and set full Product entity for the single ProductionOrderProduct
        ProductionOrderProduct pItem = order.getProduct();
        if (pItem == null) {
            throw new IllegalArgumentException("Mapped ProductionOrder entity must contain a product item");
        }
        if (pItem.getProduct() == null || pItem.getProduct().getId() == null) {
            throw new IllegalArgumentException("ProductionOrder product must include a productId");
        }
        Long prodId = pItem.getProduct().getId();
        Product prod = productRepo.findById(prodId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + prodId));
        pItem.setProduct(prod);

        // ensure back-reference and attach to order (mapper should have done it but enforce)
        pItem.setProductionOrder(order);
        order.setProduct(pItem);

        // Enforce initial state as PLANNED regardless of incoming DTO status
        order.setStatus(ProductionOrderStatus.PLANNED);
        order.setCreationDate(LocalDate.now());
        order.setStartDate(dto.getStartDate());

        order.setReference(generateReference());

        if (order.getStartDate() != null && pItem.getProduct().getProductionDurationMinutes() != null) {
            long totalMinutes = (long) (pItem.getQuantity() * pItem.getProduct().getProductionDurationMinutes());
            long daysToAdd = totalMinutes / (24 * 60);
            order.setPlannedCompletionDate(order.getStartDate().plusDays(daysToAdd));
        }

        // Persist (items cascade)
        ProductionOrder saved = productionOrderRepo.save(order);
        return saved;
    }


    private String generateReference() {
        return "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // ---- Status transition logic ----
    /**
     * Changes the status of a production order while enforcing allowed transitions
     * and updating inventories in a safe transactional way.
     */
    @Transactional
    public ProductionOrder changeStatus(Long orderId, ProductionOrderStatus targetStatus) {
        ProductionOrder order = productionOrderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Production order not found: " + orderId));

        ProductionOrderStatus current = order.getStatus();
        if (current == targetStatus) return order; // no-op

        // If already terminal, block changes
        if (current == ProductionOrderStatus.COMPLETED
                || current == ProductionOrderStatus.CANCELLED
                || current == ProductionOrderStatus.REVERSED) {
            throw new IllegalStateException("Cannot change status of an order that is " + current);
        }

        // Validate allowed transitions
        if (!isAllowedTransition(current, targetStatus)) {
            throw new IllegalStateException("Invalid status transition: " + current + " -> " + targetStatus);
        }

        // Execute transition with inventory changes as needed
        if (current == ProductionOrderStatus.PLANNED && targetStatus == ProductionOrderStatus.IN_PROGRESS) {
            startProduction(order);
        } else if (current == ProductionOrderStatus.PLANNED && targetStatus == ProductionOrderStatus.CANCELLED) {
            cancelPlanned(order);
        } else if (current == ProductionOrderStatus.IN_PROGRESS && targetStatus == ProductionOrderStatus.COMPLETED) {
            completeProduction(order);
        } else if (current == ProductionOrderStatus.IN_PROGRESS && targetStatus == ProductionOrderStatus.CANCELLED) {
            cancelInProgress(order);
        } else {
            // Shouldn't get here due to isAllowedTransition check
            throw new IllegalStateException("Unhandled transition: " + current + " -> " + targetStatus);
        }

        // Persist changes
        return productionOrderRepo.save(order);
    }

    private boolean isAllowedTransition(ProductionOrderStatus from, ProductionOrderStatus to) {
        if (from == ProductionOrderStatus.PLANNED) {
            return to == ProductionOrderStatus.IN_PROGRESS || to == ProductionOrderStatus.CANCELLED;
        }
        if (from == ProductionOrderStatus.IN_PROGRESS) {
            return to == ProductionOrderStatus.COMPLETED || to == ProductionOrderStatus.CANCELLED;
        }
        return false;
    }

    // ---- Transition handlers ----

    /**
     * Move PLANNED -> IN_PROGRESS:
     * - Reserve (deduct) raw materials immediately (pessimistic locking recommended).
     * - Set start date and status.
     */
    private void startProduction(ProductionOrder order) {
        // Validate quantities
        if (order.getRawMaterials() == null || order.getRawMaterials().isEmpty()) {
            throw new IllegalStateException("Production order has no raw materials defined.");
        }

        // Reserve/deduct each raw material (with locking at repo level)
        for (ProductionOrderMaterial item : order.getRawMaterials()) {
            RawMaterial raw = item.getRawMaterial();
            if (raw == null || raw.getId() == null) {
                throw new IllegalArgumentException("ProductionOrderItem must reference a RawMaterial");
            }
            double required = item.getQuantity();
            if (required <= 0) throw new IllegalArgumentException("Invalid required quantity: " + required);

            // IMPORTANT: repository method must lock the row (PESSIMISTIC_WRITE)
            RawMaterialInventory inventory = rawMaterialInventoryRepo
                    .findByRawMaterial(raw)
                    .orElseThrow(() -> new IllegalStateException("No inventory for raw material: " + raw.getName()));

            if (inventory.getQuantity() < required) {
                throw new IllegalStateException("Insufficient raw material '" + raw.getName()
                        + "'. Required: " + required + ", available: " + inventory.getQuantity());
            }

            // Deduct now to reserve material
            inventory.setQuantity(inventory.getQuantity() - required);
            rawMaterialInventoryRepo.save(inventory);
        }

        order.setStatus(ProductionOrderStatus.IN_PROGRESS);
        order.setStartDate(LocalDate.now());
    }

    /**
     * PLANNED -> CANCELLED: simple cancellation, no inventory changes.
     */
    private void cancelPlanned(ProductionOrder order) {
        order.setStatus(ProductionOrderStatus.CANCELLED);
        order.setPlannedCompletionDate(null);
    }

    /**
     * IN_PROGRESS -> COMPLETED:
     * - Increase finished product inventory.
     * - Set completion date and status.
     */
    private void completeProduction(ProductionOrder order) {
        // Safety: ensure started
        if (order.getStatus() != ProductionOrderStatus.IN_PROGRESS) {
            throw new IllegalStateException("Order must be IN_PROGRESS to complete");
        }

        // Single product model: get the one ProductionOrderProduct
        ProductionOrderProduct produced = order.getProduct();
        if (produced == null) {
            throw new IllegalStateException("Production order has no produced product defined.");
        }

        Product product = produced.getProduct();
        if (product == null || product.getId() == null) {
            throw new IllegalArgumentException("ProductionOrderProduct must reference a Product");
        }
        double producedQty = produced.getQuantity();
        if (producedQty <= 0) throw new IllegalArgumentException("Invalid produced quantity: " + producedQty);

        // Lock finished product inventory row and update
        ProductInventory prodInv = productInventoryRepo
                .findByProduct(product)
                .orElseThrow(() -> new IllegalStateException("No finished product inventory for product: " + product.getName()));

        prodInv.setQuantity(prodInv.getQuantity() + producedQty);
        productInventoryRepo.save(prodInv);

        order.setStatus(ProductionOrderStatus.COMPLETED);
        order.setPlannedCompletionDate(LocalDate.now());
    }

    /**
     * IN_PROGRESS -> CANCELLED:
     * - Return reserved raw materials back to inventory.
     * - Mark order cancelled.
     */
    private void cancelInProgress(ProductionOrder order) {
        if (order.getStatus() != ProductionOrderStatus.IN_PROGRESS) {
            throw new IllegalStateException("Order must be IN_PROGRESS to cancel");
        }

        // Return raw materials
        for (ProductionOrderMaterial item : order.getRawMaterials()) {
            RawMaterial raw = item.getRawMaterial();
            double quantity = item.getQuantity();

            RawMaterialInventory inventory = rawMaterialInventoryRepo
                    .findByRawMaterial(raw)
                    .orElseThrow(() -> new IllegalStateException("No inventory for raw material: " + raw.getName()));

            inventory.setQuantity(inventory.getQuantity() + quantity);
            rawMaterialInventoryRepo.save(inventory);
        }

        order.setStatus(ProductionOrderStatus.CANCELLED);
        order.setPlannedCompletionDate(null);
    }


    public ProductionOrderDto findById(Long id) {
        return ProductionOrderMapper.toDto(productionOrderRepo.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Production Order not found. Id :"+id))
        );
    }

    public List<ProductionOrderDto> findAll() {
        return productionOrderRepo.findAll().stream().map(ProductionOrderMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProductionOrder reverseCompletedOrder(Long orderId) {
        // 1) Load & lock the production order
        ProductionOrder order = productionOrderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Production order not found: " + orderId));

        // 2) Only COMPLETED orders can be reversed
        if (order.getStatus() != ProductionOrderStatus.COMPLETED) {
            throw new IllegalStateException("Only COMPLETED orders can be reversed. Current status: " + order.getStatus());
        }

        // 3) Single-product sanity checks
        ProductionOrderProduct produced = order.getProduct();
        if (produced == null || produced.getProduct() == null || produced.getProduct().getId() == null) {
            throw new IllegalStateException("Production order has no valid produced product.");
        }
        Long productId = produced.getProduct().getId();
        double producedQty = produced.getQuantity();
        if (producedQty <= 0) {
            throw new IllegalStateException("Invalid produced quantity: " + producedQty);
        }

        // 4) Lock finished product inventory and ensure sufficient qty exists to remove
        ProductInventory finInv = productInventoryRepo
                .findByProduct(produced.getProduct())
                .orElseThrow(() -> new IllegalStateException("No finished product inventory for product id: " + productId));

        if (finInv.getQuantity() < producedQty) {
            throw new IllegalStateException(String.format(
                    "Cannot reverse: finished product (id=%d) has insufficient stock. Required to remove: %s, Available: %s",
                    productId, producedQty, finInv.getQuantity()));
        }

        // 5) Aggregate raw-material quantities to return and build deterministic lock order
        // Use TreeMap to lock raw materials in ascending id order (reduce deadlock risk)
        java.util.Map<Long, Double> rawTotals = new java.util.TreeMap<>();
        if (order.getRawMaterials() != null) {
            for (ProductionOrderMaterial m : order.getRawMaterials()) {
                if (m.getRawMaterial() == null || m.getRawMaterial().getId() == null) {
                    throw new IllegalStateException("Production order contains an invalid raw material entry.");
                }
                rawTotals.merge(m.getRawMaterial().getId(), m.getQuantity(), Double::sum);
            }
        }

        // 6) Lock raw material inventory rows (in sorted order)
        java.util.Map<Long, RawMaterialInventory> lockedRawInvs = new java.util.HashMap<>();
        for (java.util.Map.Entry<Long, Double> e : rawTotals.entrySet()) {
            Long rawId = e.getKey();
            RawMaterialInventory rawInv = rawMaterialInventoryRepo
                    .findByRawMaterial(rawMaterialRepo.findById(rawId).orElseThrow())
                    .orElseThrow(() -> new IllegalStateException("No raw material inventory for id: " + rawId));
            lockedRawInvs.put(rawId, rawInv);
        }

        // 7) All checks passed. Perform inventory changes:
        // 7.a Subtract produced finished goods
        finInv.setQuantity(finInv.getQuantity() - producedQty);
        productInventoryRepo.save(finInv);

        // 7.b Return raw materials back to inventory
        for (java.util.Map.Entry<Long, Double> e : rawTotals.entrySet()) {
            Long rawId = e.getKey();
            Double qtyToReturn = e.getValue();
            RawMaterialInventory rawInv = lockedRawInvs.get(rawId);

            rawInv.setQuantity(rawInv.getQuantity() + qtyToReturn);
            rawMaterialInventoryRepo.save(rawInv);
        }

        // 8) Mark order as REVERSED and record audit info (ensure fields exist on entity)
        order.setStatus(ProductionOrderStatus.REVERSED);
//        order.setReversalDate(java.time.LocalDate.now()); // add this field to ProductionOrder if not present
//        order.setReversedBy(reversedBy);                  // add this field (String) to track who did it
//        order.setReversalReason(reason);                  // add this field (String) to store the reason

        // Persist and return
        return productionOrderRepo.save(order);
    }


}
