"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import {
  useAddItem,
  useTogglePurchased,
  useRemoveItem,
  useOrderProfitSummary,
} from "@/lib/hooks/use-orders";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { ItemTypeCombobox } from "@/components/orders/item-type-combobox";
import { formatPesewas } from "@/lib/utils/order";
import type { GqlOrderItem, GqlOrderItemMetadata } from "@/types/graphql";

interface CostBookPanelProps {
  orderId: string;
  items: GqlOrderItem[];
}

const METADATA_MAX_ENTRIES = 10;
const METADATA_LABEL_MAX = 60;
const METADATA_VALUE_MAX = 200;

export function CostBookPanel({ orderId, items }: CostBookPanelProps) {
  const [itemType, setItemType] = useState("material");
  const [name, setName] = useState("");
  const [unitCostGhs, setUnitCostGhs] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState<GqlOrderItemMetadata[]>([]);
  const [metaLabel, setMetaLabel] = useState("");
  const [metaValue, setMetaValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { options } = useBlueprintOptions();
  // The blueprint_options resolver returns item types under designFields
  // because it's anything-but the three flat top-level categories. The
  // server keeps the {value, label} shape, so no extra normalisation here.
  const itemTypeOptions = options?.designFields?.item_type ?? [];

  const { addItem, loading: adding } = useAddItem();
  const { togglePurchased, loading: toggling } = useTogglePurchased();
  const { removeItem, loading: removing } = useRemoveItem();
  const { summary } = useOrderProfitSummary(orderId);

  // Track which row is mid-action so only that row's button spins (a single
  // global `toggling`/`removing` would spin every row).
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const resetForm = () => {
    setItemType("material");
    setName("");
    setUnitCostGhs("");
    setQuantity("1");
    setDescription("");
    setMetadata([]);
    setMetaLabel("");
    setMetaValue("");
    setShowForm(false);
  };

  const addMetadataPair = () => {
    const l = metaLabel.trim();
    const v = metaValue.trim();
    if (!l || !v) return;
    if (metadata.length >= METADATA_MAX_ENTRIES) return;
    setMetadata([...metadata, { label: l, value: v }]);
    setMetaLabel("");
    setMetaValue("");
  };

  const removeMetadataPair = (i: number) => {
    setMetadata(metadata.filter((_, idx) => idx !== i));
  };

  const handleAdd = async () => {
    if (!name || !unitCostGhs) return;
    const result = await addItem({
      orderId,
      itemType: itemType || "material",
      name: name.trim(),
      description: description.trim() || undefined,
      metadata: metadata.length > 0 ? metadata : undefined,
      unitCost: Math.round(parseFloat(unitCostGhs) * 100),
      quantity: parseInt(quantity) || 1,
    });
    // Apollo's `update` callback on the mutation appends the new item to
    // the order's items array in the cache, so the panel re-renders with
    // no GET_ORDER refetch — no parent-driven onItemChange needed.
    if (result) {
      resetForm();
    }
  };

  const handleToggle = async (itemId: string) => {
    setPendingToggleId(itemId);
    try {
      // Pass orderId so the hook refetches orderProfitSummary — the
      // "n/m items purchased" + totalItemCost line is computed
      // server-side and won't recompute from Apollo's by-id merge alone.
      await togglePurchased(itemId, orderId);
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setPendingRemoveId(itemId);
    try {
      await removeItem(itemId, orderId);
    } finally {
      setPendingRemoveId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const metadataAtCap = metadata.length >= METADATA_MAX_ENTRIES;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Cost Book</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showForm && (
          <div className="space-y-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                placeholder="e.g. Ankara Fabric, Singer tracing wheel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label>Type</Label>
              <ItemTypeCombobox
                options={itemTypeOptions}
                value={itemType}
                onChange={setItemType}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-cost">Unit Cost (GHS)</Label>
                <Input
                  id="item-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="80.00"
                  value={unitCostGhs}
                  onChange={(e) => setUnitCostGhs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="item-qty">Qty</Label>
                <Input
                  id="item-qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="item-description">
                Description{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="item-description"
                placeholder="Anything specific about this purchase..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Metadata: ad-hoc key/value details */}
            <div className="space-y-2">
              <Label>
                More details{" "}
                <span className="text-muted-foreground text-xs">
                  ({metadata.length}/{METADATA_MAX_ENTRIES})
                </span>
              </Label>
              {metadata.length > 0 && (
                <div className="space-y-1.5">
                  {metadata.map((pair, i) => (
                    <div
                      key={`${pair.label}-${i}`}
                      className="bg-muted/40 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs"
                    >
                      <span className="text-muted-foreground shrink-0 font-medium">
                        {pair.label}:
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {pair.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMetadataPair(i)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Remove ${pair.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {!metadataAtCap && (
                <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <Input
                    placeholder="Label"
                    value={metaLabel}
                    maxLength={METADATA_LABEL_MAX}
                    onChange={(e) => setMetaLabel(e.target.value)}
                    aria-label="Detail label"
                  />
                  <Input
                    placeholder="Value"
                    value={metaValue}
                    maxLength={METADATA_VALUE_MAX}
                    onChange={(e) => setMetaValue(e.target.value)}
                    aria-label="Detail value"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMetadataPair();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMetadataPair}
                    disabled={!metaLabel.trim() || !metaValue.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!name || !unitCostGhs}
                loading={adding}
                loadingLabel="Adding..."
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetForm}
                disabled={adding}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <p className="text-muted-foreground py-2 text-center text-sm">
            No items added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((m) => {
              const hasDetails =
                !!m.description || (m.metadata && m.metadata.length > 0);
              const expanded = expandedIds.has(m.id);
              const typeLabel =
                itemTypeOptions.find((o) => o.value === m.itemType)?.label ??
                m.itemType;
              return (
                <div key={m.id} className="rounded-lg border">
                  <div className="flex items-center gap-3 p-3">
                    <Switch
                      checked={m.isPurchased}
                      onCheckedChange={() => handleToggle(m.id)}
                      disabled={toggling && pendingToggleId === m.id}
                      aria-label={`Mark ${m.name} as purchased`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`min-w-0 truncate text-sm font-medium ${m.isPurchased ? "text-muted-foreground line-through" : ""}`}
                        >
                          {m.name}
                        </p>
                        {m.itemType && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px] uppercase"
                          >
                            {typeLabel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {formatPesewas(m.unitCost)} x {m.quantity} ={" "}
                        {formatPesewas(m.totalCost)}
                      </p>
                    </div>
                    {hasDetails && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          expanded
                            ? `Collapse ${m.name} details`
                            : `Expand ${m.name} details`
                        }
                        className="text-muted-foreground h-8 w-8 shrink-0"
                        onClick={() => toggleExpand(m.id)}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${m.name}`}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                      onClick={() => handleRemove(m.id)}
                      loading={removing && pendingRemoveId === m.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {expanded && hasDetails && (
                    <div className="space-y-2 border-t px-3 py-2.5 text-xs">
                      {m.description && (
                        <p className="text-muted-foreground">{m.description}</p>
                      )}
                      {m.metadata && m.metadata.length > 0 && (
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                          {m.metadata.map((pair, i) => (
                            <div key={`${m.id}-meta-${i}`} className="contents">
                              <dt className="text-muted-foreground font-medium">
                                {pair.label}
                              </dt>
                              <dd>{pair.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Profit summary */}
        {summary && summary.confirmedPrice > 0 && (
          <>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{formatPesewas(summary.totalItemCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Price</span>
                <span>{formatPesewas(summary.confirmedPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Profit</span>
                <span
                  className={
                    summary.profit >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatPesewas(summary.profit)} ({summary.marginPercent}%)
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {summary.purchasedCount}/{summary.itemCount} items purchased
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
