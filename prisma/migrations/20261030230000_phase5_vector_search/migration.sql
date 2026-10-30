-- Existing 3-dimensional placeholder vectors are incompatible with the
-- semantic model and are derived data, so discard them before changing shape.
DELETE FROM "ProductEmbedding";

ALTER TABLE "ProductEmbedding"
ALTER COLUMN "embedding" TYPE vector(384)
USING "embedding"::text::vector(384);
