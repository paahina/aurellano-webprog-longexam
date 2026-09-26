import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import AdminModal from "../../components/Admin/AdminModal";
import AdminTablePagination from "../../components/Admin/AdminTablePagination";
import AdminTableSkeleton from "../../components/Admin/AdminTableSkeleton";
import AdminTableToolbar, {
  PRODUCT_SORT_OPTIONS,
  productSortToQuery,
} from "../../components/Admin/AdminTableToolbar";
import StockStatusChip from "../../components/Admin/StockStatusChip";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductImage from "../../components/ProductImage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useAdminTableQuery } from "../../hooks/useAdminTableQuery";
import {
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getProductsRequest,
  getSupplierProductsRequest,
  getSuppliersRequest,
  updateProductRequest,
} from "../../services/api";
import { formatPeso, getId } from "../../utils/format";
import { deriveStockStatus } from "../../utils/stock";

const PAGE_SIZE = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = {
  productName: "",
  productSlug: "",
  productDescription: "",
  productPrice: "",
  categoryId: "",
  supplierId: "",
  stockQuantity: "0",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none";

const formsEqual = (a, b) =>
  a.productName === b.productName &&
  a.productSlug === b.productSlug &&
  a.productDescription === b.productDescription &&
  a.productPrice === b.productPrice &&
  a.categoryId === b.categoryId &&
  a.supplierId === b.supplierId &&
  a.stockQuantity === b.stockQuantity;

const AdminProductsPage = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const isSupplier = user?.userRole === "supplier";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { sort, page, setSort, setPage } = useAdminTableQuery(
    "az",
    PRODUCT_SORT_OPTIONS.map((option) => option.value)
  );

  const load = async () => {
    setLoading(true);
    try {
      const query = {
        page,
        limit: PAGE_SIZE,
        sort: productSortToQuery(sort),
      };
      const [productResult, categoryList, supplierList] = await Promise.all([
        isSupplier
          ? getSupplierProductsRequest(query, token)
          : getProductsRequest(query),
        getCategoriesRequest(),
        isSupplier ? Promise.resolve([]) : getSuppliersRequest(),
      ]);
      setProducts(productResult.products);
      setTotalPages(productResult.totalPages ?? 1);
      setCategories(Array.isArray(categoryList) ? categoryList : categoryList?.data || []);
      setSuppliers(Array.isArray(supplierList) ? supplierList : supplierList?.data || []);
    } catch (err) {
      showToast(err.message, "error");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, sort, page, isSupplier, user?.supplierId]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages, setPage]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearImageSelection = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetModalState = () => {
    clearImageSelection();
    setExistingImage("");
    setRemoveImage(false);
    setImageError("");
    setEditing(null);
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setModalOpen(false);
    setDiscardOpen(false);
  };

  const isDirty = () => {
    if (!formsEqual(form, initialForm)) return true;
    if (imageFile || removeImage) return true;
    return false;
  };

  const openCreate = () => {
    const nextForm = {
      ...emptyForm,
      supplierId: isSupplier ? getId(user?.supplierId) : emptyForm.supplierId,
    };
    setEditing(null);
    setForm(nextForm);
    setInitialForm(nextForm);
    clearImageSelection();
    setExistingImage("");
    setRemoveImage(false);
    setImageError("");
    setModalOpen(true);
    setFormError("");
  };

  const openEdit = (product) => {
    const nextForm = {
      productName: product.productName || "",
      productSlug: product.productSlug || "",
      productDescription: product.productDescription || "",
      productPrice: String(product.productPrice ?? ""),
      categoryId: getId(product.categoryId),
      supplierId: getId(product.supplierId),
      stockQuantity: String(product.stockQuantity ?? 0),
    };
    setEditing(product);
    setForm(nextForm);
    setInitialForm(nextForm);
    clearImageSelection();
    setExistingImage(product.productImage || "");
    setRemoveImage(false);
    setImageError("");
    setModalOpen(true);
    setFormError("");
  };

  const requestCloseModal = () => {
    if (saving) return;
    if (isDirty()) {
      setDiscardOpen(true);
      return;
    }
    resetModalState();
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "productName" && !editing) {
        next.productSlug = slugify(value);
      }
      return next;
    });
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) {
      clearImageSelection();
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPEG, PNG, or WebP images are allowed.");
      clearImageSelection();
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image file too large. Maximum size is 5MB.");
      clearImageSelection();
      return;
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const onRemoveImage = () => {
    clearImageSelection();
    setImageError("");
    if (existingImage) setRemoveImage(true);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setImageError("");

    const formData = new FormData();
    formData.append("productName", form.productName.trim());
    formData.append("productSlug", form.productSlug.trim() || slugify(form.productName));
    formData.append("productDescription", form.productDescription.trim());
    formData.append("productPrice", String(Number(form.productPrice)));
    formData.append("categoryId", form.categoryId);
    formData.append("supplierId", form.supplierId);
    formData.append("stockQuantity", String(Number(form.stockQuantity)));
    if (imageFile) formData.append("image", imageFile);
    else if (editing && removeImage) formData.append("removeImage", "true");

    try {
      if (editing) {
        await updateProductRequest(editing._id, formData, token);
        showToast("Product updated.", "success");
      } else {
        await createProductRequest(formData, token);
        showToast("Product created.", "success");
      }
      resetModalState();
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProductRequest(deleteTarget._id, token);
      showToast("Product deleted.", "success");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const rows = useMemo(() => products, [products]);
  const previewSrc = imagePreview || (removeImage ? "" : existingImage);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Catalog
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
            <Package className="h-7 w-7" strokeWidth={2} />
            Products
          </h1>
        </div>
        <Button type="button" variant="custom2" onClick={openCreate}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Create product
          </span>
        </Button>
      </div>

      <AdminTableToolbar
        sort={sort}
        onSortChange={setSort}
        sortOptions={PRODUCT_SORT_OPTIONS}
      />

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {loading ? (
          <AdminTableSkeleton columns={5} label="Loading products" />
        ) : !rows.length ? (
          <p className="p-6 text-sm text-zinc-600">No products yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-primary text-neutral1">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={product._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                        <ProductImage
                          src={product.productImage}
                          alt={product.productName}
                          className="aspect-square w-10 object-cover"
                          iconClassName="h-4 w-4"
                        />
                      </div>
                      <span className="font-medium text-primary">{product.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.categoryId?.categoryName || "—"}
                  </td>
                  <td className="px-4 py-3">{formatPeso(product.productPrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="font-medium text-zinc-700">{product.stockQuantity}</span>
                      <StockStatusChip status={product.stockStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="custom5" onClick={() => openEdit(product)}>
                        <span className="inline-flex items-center gap-1">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </span>
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setDeleteTarget(product)}>
                        <span className="inline-flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading ? (
          <AdminTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            label="Products pagination"
          />
        ) : null}
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit product" : "Create product"}
        onClose={requestCloseModal}
        wide
      >
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          {formError ? <p className="text-sm text-red-700 sm:col-span-2">{formError}</p> : null}
          <label className="text-sm sm:col-span-2">
            Name
            <input name="productName" value={form.productName} onChange={onChange} required className={inputClass} />
          </label>
          <label className="text-sm">
            Slug
            <input name="productSlug" value={form.productSlug} onChange={onChange} required className={inputClass} />
          </label>
          <label className="text-sm">
            Price
            <input
              name="productPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.productPrice}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={onChange}
              required
              className={`${inputClass} min-h-24`}
            />
          </label>
          <div className="text-sm sm:col-span-2">
            <span>
              Product image <span className="text-zinc-500">(optional)</span>
            </span>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onImageChange}
                className={`${inputClass} mt-0 sm:flex-1`}
              />
              <div className="flex shrink-0 flex-col items-start gap-2">
                <div className="overflow-hidden rounded-xl bg-zinc-200">
                  <ProductImage
                    key={previewSrc || "empty"}
                    src={previewSrc}
                    alt={form.productName || "Product preview"}
                    className="aspect-square w-[7.5rem] object-cover"
                    iconClassName="h-8 w-8"
                  />
                </div>
                {previewSrc ? (
                  <Button type="button" variant="danger" onClick={onRemoveImage} disabled={saving}>
                    Remove image
                  </Button>
                ) : null}
              </div>
            </div>
            {removeImage ? (
              <p className="mt-2 text-xs text-zinc-500">The current image will be removed when you save.</p>
            ) : null}
            {imageError ? <p className="mt-2 text-sm text-red-700">{imageError}</p> : null}
          </div>
          <label className="text-sm">
            Category
            <select name="categoryId" value={form.categoryId} onChange={onChange} required className={inputClass}>
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>
          </label>
          {!isSupplier ? (
            <label className="text-sm">
              Supplier
              <select
                name="supplierId"
                value={form.supplierId}
                onChange={onChange}
                required
                className={inputClass}
              >
                <option value="">Select supplier</option>
                {suppliers.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.supplierName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm">
            Stock quantity
            <input
              name="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <div className="text-sm">
            <span>Stock status</span>
            <div className="mt-2">
              <StockStatusChip status={deriveStockStatus(form.stockQuantity)} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Auto-calculated when saved.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" variant="custom2" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="custom5" onClick={requestCloseModal} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.productName}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deleting}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={discardOpen}
        title="Discard changes"
        message="You have unsaved changes. Discard them and close?"
        confirmLabel="Yes"
        cancelLabel="No"
        confirmVariant="danger"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={resetModalState}
      />
    </div>
  );
};

export default AdminProductsPage;
