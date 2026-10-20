<?php

namespace App\Concerns;

trait MapsLegacyAttributes
{
    /**
     * Define the attribute mapping in the model using:
     * protected $legacyMapping = ['english_name' => 'spanish_name'];
     */

    public function getAttribute($key)
    {
        $isMapped = false;
        if (property_exists($this, 'legacyMapping') && array_key_exists($key, $this->legacyMapping)) {
            $key = $this->legacyMapping[$key];
            $isMapped = true;
        }

        $value = parent::getAttribute($key);

        if ($key === 'activo' && $isMapped) {
            return $value === 'si';
        }

        return $value;
    }

    public function setAttribute($key, $value)
    {
        if (property_exists($this, 'legacyMapping') && array_key_exists($key, $this->legacyMapping)) {
            $key = $this->legacyMapping[$key];
        }

        if ($key === 'activo') {
            if ($value === true || $value === 1 || $value === '1' || $value === 'si') {
                $value = 'si';
            } elseif ($value === false || $value === 0 || $value === '0' || $value === 'no') {
                $value = 'no';
            }
        }

        return parent::setAttribute($key, $value);
    }

    public function getFillable()
    {
        $fillable = parent::getFillable();

        if (property_exists($this, 'legacyMapping')) {
            $mapped = [];
            foreach ($fillable as $key) {
                if (isset($this->legacyMapping[$key])) {
                    $mapped[] = $this->legacyMapping[$key];
                }
                $englishKey = array_search($key, $this->legacyMapping);
                if ($englishKey) {
                    $mapped[] = $englishKey;
                }
            }
            return array_values(array_unique(array_merge($fillable, $mapped)));
        }

        return $fillable;
    }

    public function isFillable($key)
    {
        return in_array($key, $this->getFillable());
    }

    public function attributesToArray()
    {
        $attributes = parent::attributesToArray();
        
        if (property_exists($this, 'legacyMapping')) {
            foreach ($this->legacyMapping as $english => $spanish) {
                if (array_key_exists($spanish, $attributes)) {
                    $attributes[$english] = $attributes[$spanish];
                    unset($attributes[$spanish]);
                }
            }
        }

        return $attributes;
    }

    /**
     * We need to override getCasts so that mapped attributes get properly casted if defined using English keys
     */
    protected function castAttribute($key, $value)
    {
        if (property_exists($this, 'legacyMapping') && in_array($key, $this->legacyMapping)) {
            $englishKey = array_search($key, $this->legacyMapping);
            if ($this->hasCast($englishKey)) {
                return parent::castAttribute($englishKey, $value);
            }
        }
        return parent::castAttribute($key, $value);
    }
}
