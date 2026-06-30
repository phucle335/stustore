"use client";

import { useMemo, useState } from "react";
import clothingSizeGuideData from "@/data/clothing-size-guide.json";
import sizeGuideData from "@/data/size-guide.json";
import styles from "@/styles/components/store/SizeGuideModal.module.css";

type SizeGuideModalProps = {
  open: boolean;
  onClose: () => void;
  sizeGuideType?: "shoe" | "clothing";
};

type SizeGuideBrand = {
  name: string;
  sizes: number[];
  us: number[];
  uk: number[];
  cm: number[];
};

type ClothingBrand = {
  name: string;
  sizes: string[];
  chest: number[];
  waist: number[];
  hips: number[];
  sleeveLength: number[];
  inseamLength: number[];
  conversion: {
    international: string[];
    eu: string[];
    us: string[];
    uk: string[];
    recommendedCm: string[];
  };
};

type MeasurementStep = {
  title: string;
  body: string;
};

const SHOE_STEPS: MeasurementStep[] = [
  {
    title: "Step 1: Preparation",
    body:
      "Gather a pen, a ruler, a sheet of paper, and the socks you plan to wear with the shoes.",
  },
  {
    title: "Step 2: Trace Your Foot",
    body:
      "Wear your socks and stand firmly on the paper. Use the pen to trace the outline of your foot while keeping it still.",
  },
  {
    title: "Step 3: Measure Foot Length",
    body:
      "Mark the heel and longest toe, then measure the distance between those two points.",
  },
  {
    title: "Step 4: Measure Foot Width",
    body:
      "Measure the widest part of your foot, usually around the ball of the foot or forefoot area.",
  },
  {
    title: "Step 5: Calculate Your Shoe Size",
    body:
      "Use the formula: Shoe Size = Foot Length (L) + 1.5 cm. Then compare the result with the size chart to choose the most suitable size.",
  },
];

const CLOTHING_STEPS: MeasurementStep[] = [
  {
    title: "1. CHEST",
    body:
      "To get the correct measurement, wrap a measuring tape around the fullest part of your chest and across your back, keeping the tape horizontal.",
  },
  {
    title: "2. WAIST",
    body:
      "Measure around the narrowest part of your waist while keeping the tape horizontal.",
  },
  {
    title: "3. HIPS",
    body:
      "Stand with your feet together and measure around the fullest part of your hips, keeping the tape horizontal.",
  },
  {
    title: "4. SLEEVE LENGTH",
    body:
      "Measure from the top of the shoulder down to the end of the sleeve.",
  },
  {
    title: "5. INSEAM LENGTH",
    body:
      "Measure from the crotch seam down to your heel. Please note that this measurement is based on a standard inseam construction.",
  },
];

export function SizeGuideModal({
  open,
  onClose,
  sizeGuideType = "shoe",
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"measure" | "brands">("measure");
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);

  const titleId = `size-guide-title-${sizeGuideType}`;

  const shoeBrands = useMemo<SizeGuideBrand[]>(() => sizeGuideData.brands, []);
  const clothingBrands = useMemo<ClothingBrand[]>(
    () => clothingSizeGuideData.brands,
    [],
  );

  const brands = sizeGuideType === "shoe" ? shoeBrands : clothingBrands;
  const isClothing = sizeGuideType === "clothing";
  const selectedBrand = brands[selectedBrandIndex];
  const sizeCount = selectedBrand && "sizes" in selectedBrand
    ? selectedBrand.sizes.length
    : 0;

  return (
    <div
      className={`${styles.backdrop}${open ? ` ${styles.backdropOpen}` : ""}`}
      aria-hidden={!open}
    >
      <div
        id="size-guide-modal"
        className={`${styles.modal}${open ? ` ${styles.modalOpen}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.modalHeader}>
          <h2 id={titleId} className={styles.modalTitle}>
            {isClothing
              ? "How to Choose Your Clothing Size"
              : "How to Choose Your Size"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close size guide"
          >
            &times;
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton}${activeTab === "measure" ? ` ${styles.tabButtonActive}` : ""}`}
            onClick={() => setActiveTab("measure")}
          >
            {isClothing ? "How to Measure Your Body" : "How to Measure Your Feet"}
          </button>
          <button
            type="button"
            className={`${styles.tabButton}${activeTab === "brands" ? ` ${styles.tabButtonActive}` : ""}`}
            onClick={() => setActiveTab("brands")}
          >
            Brand Size Guide
          </button>
        </div>

        <div className={styles.panels}>
          {activeTab === "measure" ? (
            <div className={styles.measurePanel}>
              <div className={styles.sectionTitleBlock}>
                <p className={styles.sectionTitle}>
                  {isClothing
                    ? "How to Choose the Right Clothing Size"
                    : "How to Measure Your Feet Correctly"}
                </p>
                <p className={styles.sectionSubtitle}>
                  {isClothing
                    ? "Follow these instructions to determine your correct clothing size."
                    : "(For customers with standard foot shapes according to most footwear brands.)"}
                </p>
              </div>
              <div className={styles.steps}>
                {(isClothing ? CLOTHING_STEPS : SHOE_STEPS).map(
                  (step, index) => (
                    <div key={step.title} className={styles.step}>
                      <span className={styles.stepIndex}>{index + 1}</span>
                      <div>
                        <p className={styles.stepTitle}>{step.title}</p>
                        <p className={styles.stepBody}>{step.body}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
              {isClothing ? (
                <p className={styles.footerNote}>
                  After taking your measurements, compare them with the size
                  chart of your selected brand to find the best fit.
                </p>
              ) : null}
            </div>
          ) : (
            <div className={styles.brandPanel}>
              <div className={styles.brandListWrap}>
                <ul className={styles.brandList} role="tablist">
                  {brands.map((brand, index) => (
                    <li key={brand.name} role="presentation">
                      <button
                        type="button"
                        className={`${styles.brandButton}${index === selectedBrandIndex ? ` ${styles.brandButtonActive}` : ""}`}
                        role="tab"
                        aria-selected={index === selectedBrandIndex}
                        onClick={() => setSelectedBrandIndex(index)}
                      >
                        {brand.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.brandDetailWrap}>
                {selectedBrand && (
                  <>
                    <div className={styles.brandHeader}>
                      <p className={styles.brandTitle}>{selectedBrand.name}</p>
                      <p className={styles.brandSubtitle}>
                        {isClothing
                          ? "Size reference: Chest / Waist / Hips / Sleeve / Inseam"
                          : "EU / US / UK / CM size reference"}
                      </p>
                    </div>

                    {isClothing && "conversion" in selectedBrand ? (
                      <div className={styles.tablesWrap}>
                        <div className={styles.tableWrap}>
                          <table className={styles.sizeTable}>
                            <thead>
                              <tr>
                                <th scope="col">Size</th>
                                <th scope="col">Chest (cm)</th>
                                <th scope="col">Waist (cm)</th>
                                <th scope="col">Hips (cm)</th>
                                <th scope="col">Sleeve (cm)</th>
                                <th scope="col">Inseam (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: sizeCount }).map(
                                (_, index) => (
                                  <tr key={index}>
                                    <td>
                                      {(selectedBrand as ClothingBrand).sizes[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).chest[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).waist[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).hips[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).sleeveLength[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).inseamLength[index]}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className={styles.conversionWrap}>
                          <p className={styles.conversionTitle}>
                            Size Conversion
                          </p>
                          <table className={styles.sizeTable}>
                            <thead>
                              <tr>
                                <th scope="col">International</th>
                                <th scope="col">EU</th>
                                <th scope="col">US</th>
                                <th scope="col">UK</th>
                                <th scope="col">Recommended (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: sizeCount }).map(
                                (_, index) => (
                                  <tr key={index}>
                                    <td>
                                      {(selectedBrand as ClothingBrand).conversion.international[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).conversion.eu[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).conversion.us[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).conversion.uk[index]}
                                    </td>
                                    <td>
                                      {(selectedBrand as ClothingBrand).conversion.recommendedCm[index]}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.tableWrap}>
                        <table className={styles.sizeTable}>
                          <thead>
                            <tr>
                              <th scope="col">EU</th>
                              <th scope="col">US</th>
                              <th scope="col">UK</th>
                              <th scope="col">CM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: sizeCount }).map(
                              (_, index) => (
                                <tr key={index}>
                                  <td>
                                    {(selectedBrand as SizeGuideBrand).sizes[index]}
                                  </td>
                                  <td>
                                    {(selectedBrand as SizeGuideBrand).us[index]}
                                  </td>
                                  <td>
                                    {(selectedBrand as SizeGuideBrand).uk[index]}
                                  </td>
                                  <td>
                                    {(selectedBrand as SizeGuideBrand).cm[index]}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className={styles.footerNote}>
                      Measurements may vary slightly depending on the product&apos;s
                      fit and collection.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
