<template>
    <div>
        <Splitter style="height: 100em">
            <SplitterPanel :size="5">
                Current user profile
            </SplitterPanel>

            <SplitterPanel>
                <TabView>
                    <TabPanel header="Match History">
                        Match History
                    </TabPanel>
                    <TabPanel header="Achievement">
                        Achievement
                    </TabPanel>
                    <TabPanel header="Ladder">
                        Ladder
                    </TabPanel>
                </TabView>
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<script setup lang="ts">
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

</script>

<style>

</style>