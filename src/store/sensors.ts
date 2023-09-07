import { defineStore } from 'pinia'
import { Sensor } from '@/types'
import { createPatchObject } from '@/utils/api'

export const useSensorStore = defineStore('sensor', {
  state: () => ({ sensors: [] as Sensor[], loaded: false }),
  getters: {},
  actions: {
    sortSensors() {
      this.sensors.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchSensors() {
      if (this.sensors.length > 0) return
      try {
        const { data } = await this.$http.get('/data/sensors')
        this.sensors = data
        this.sortSensors()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching units from DB', error)
      }
    },
    async updateSensor(sensor: Sensor) {
      try {
        const patchData = createPatchObject(
          this.getSensorById(sensor.id),
          sensor
        )
        if (Object.keys(patchData).length === 0) return
        console.log('sensor', patchData)
        const { data } = await this.$http.patch(
          `/data/sensors/${sensor.id}`,
          sensor
        )
        const index = this.sensors.findIndex((s) => s.id === sensor.id)
        if (index !== -1) {
          this.sensors[index] = data
        }
        this.sortSensors()
      } catch (error) {
        console.error('Error updating sensor', error)
      }
    },
    async createSensor(sensor: Sensor) {
      try {
        const { data } = await this.$http.post('/data/sensors', sensor)
        this.sensors.push(data)
        this.sortSensors()
        return data
      } catch (error) {
        console.error('Error creating sensor', error)
      }
    },
    async deleteSensor(id: string) {
      try {
        const response = await this.$http.delete(`/data/sensors/${id}`)
        if (response.status === 200 || response.status === 204) {
          this.sensors = this.sensors.filter((sensor) => sensor.id !== id)
          this.sortSensors()
        } else console.error('Error deleting sensor from server', response)
      } catch (error) {
        console.error('Error deleting sensor', error)
      }
    },
    getSensorById(id: string) {
      const sensor = this.sensors.find((sensor) => sensor.id === id)
      if (!sensor) throw new Error(`Processing Level with id ${id} not found`)
      return sensor
    },
  },
})
