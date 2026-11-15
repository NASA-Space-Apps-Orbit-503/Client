-- Read-only reconciliation with unificar() in Armonizacion_corregido (1).ipynb.
-- Duplicate identity: normalized satellite + UTC acquisition timestamp + coordinates
-- rounded to 4 decimal places. The notebook keeps the first row before filtering dates.
-- With the currently connected dataset, this yields MODIS 26190, VIIRS 26559.
WITH parsed AS (
  SELECT *,
    try_strptime(
      cast(acq_date AS VARCHAR) || ' ' || lpad(acq_time, 4, '0'),
      '%Y-%m-%d %H%M'
    ) AS utc_timestamp
  FROM detections_harmonized
), unique_detections AS (
  SELECT *
  FROM parsed
  WHERE utc_timestamp IS NOT NULL
    AND satellite_name IS NOT NULL
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
  QUALIFY row_number() OVER (
    PARTITION BY satellite_name, utc_timestamp, round(latitude, 4), round(longitude, 4)
    ORDER BY id
  ) = 1
)
SELECT instrument, count(*) AS detections
FROM unique_detections
WHERE cast(utc_timestamp - INTERVAL '6 hours' AS DATE)
      BETWEEN DATE '2002-01-01' AND DATE '2025-01-01'
  AND latitude BETWEEN 13.10 AND 14.50
  AND longitude BETWEEN -90.20 AND -87.60
GROUP BY instrument
ORDER BY instrument;
